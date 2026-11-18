import * as THREE from 'three';
import {
  LoadedEditorialAssets,
  PAGE_TEX_H,
  PAGE_TEX_W,
  RING_NORMALIZED_Z,
  createCoverMaterialRoughnessMap,
  createGrainNormalMap,
  createPageEdgeTexture,
  drawHardcoverBackTexture,
  drawHardcoverFrontBoardTexture,
  drawHardcoverFrontTexture,
  drawSpreadPageTexture,
} from './textures.ts';

export const NB_DIMS = {
  PAGE_W: 2.04,
  PAGE_H: 2.86,
  COVER_W: 2.15,
  COVER_H: 2.98,
  COVER_THICKNESS: 0.038,
  SPINE_GAP: 0.055,
  TABLE_Y: -0.105,
  BACK_COVER_CENTER_Y: -0.086,
  COVER_PIVOT_Y: -0.035,
  STACK_BASE_Y: -0.067,
  SEG_X: 28,
  SEG_Z: 20,
} as const;

export interface TurningSheetRig {
  group: THREE.Group;
  frontMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
  backMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
  frontCanvas: HTMLCanvasElement;
  frontTexture: THREE.CanvasTexture;
  backCanvas: HTMLCanvasElement;
  backTexture: THREE.CanvasTexture;
  yRight: number;
  yLeft: number;
  lastTurn: number;
}

export interface NotebookRig {
  root: THREE.Group;
  coverPivot: THREE.Group;
  coverFrontCanvas: HTMLCanvasElement;
  coverFrontTexture: THREE.CanvasTexture;
  coverInnerCanvas: HTMLCanvasElement;
  coverInnerTexture: THREE.CanvasTexture;
  sheets: TurningSheetRig[];
  backBaseCanvas: HTMLCanvasElement;
  backBaseTexture: THREE.CanvasTexture;
  leftStack: THREE.Mesh;
  rightStack: THREE.Mesh;
  contactShadowClosed: THREE.Mesh;
  contactShadowOpen: THREE.Mesh;
  disposables: Array<{ dispose: () => void }>;
  updateCoverTurn: (coverTurn: number) => void;
  updateSheetTurn: (index: number, turn: number) => void;
  updateStacks: (
    leftRatio: number,
    rightRatio: number,
    coverTurn: number,
    sheetTurns?: [number, number, number]
  ) => void;
  repaintAllStatic: (assets: LoadedEditorialAssets) => void;
  updateSpreadAnimTexture: (spreadIndex: number, anim: number, assets: LoadedEditorialAssets) => boolean;
}

function createRoundedBoardGeometry(width: number, height: number, depth: number, radius = 0.045): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const x0 = NB_DIMS.SPINE_GAP - 0.035;
  const x1 = x0 + width;
  const y0 = -height / 2;
  const y1 = height / 2;

  shape.moveTo(x0, y0);
  shape.lineTo(x1 - radius, y0);
  shape.quadraticCurveTo(x1, y0, x1, y0 + radius);
  shape.lineTo(x1, y1 - radius);
  shape.quadraticCurveTo(x1, y1, x1 - radius, y1);
  shape.lineTo(x0, y1);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
    curveSegments: 8,
  });
  // Rotate so extrusion depth sits along Y [-depth/2 .. +depth/2] and page spans XZ
  geo.rotateX(Math.PI / 2);
  geo.translate(0, depth / 2, 0);
  return geo;
}

/** Creates an XZ plane geometry pivoted along spine gap with controllable front/back UV orientation */
function createPageFaceGeometry(width: number, height: number, segX: number, segZ: number, flipBackSide: boolean): THREE.BufferGeometry {
  const cols = segX + 1;
  const rows = segZ + 1;
  const vertCount = cols * rows;
  const positions = new Float32Array(vertCount * 3);
  const normals = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);

  for (let iz = 0; iz <= segZ; iz++) {
    const tz = iz / segZ;
    const z = -height / 2 + tz * height;
    const v = 1 - tz; // canvas top = v=1

    for (let ix = 0; ix <= segX; ix++) {
      const u = ix / segX;
      const x = NB_DIMS.SPINE_GAP + u * width;
      const idx = iz * cols + ix;

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = flipBackSide ? -0.0014 : 0.0014;
      positions[idx * 3 + 2] = z;

      normals[idx * 3] = 0;
      normals[idx * 3 + 1] = flipBackSide ? -1 : 1;
      normals[idx * 3 + 2] = 0;

      // Back face swaps horizontal UV so flipped left page reads cleanly left-to-right!
      uvs[idx * 2] = flipBackSide ? 1 - u : u;
      uvs[idx * 2 + 1] = v;
    }
  }

  const indices: number[] = [];
  for (let iz = 0; iz < segZ; iz++) {
    for (let ix = 0; ix < segX; ix++) {
      const a = iz * cols + ix;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      if (!flipBackSide) {
        // Outward normal +Y
        indices.push(a, c, b, b, c, d);
      } else {
        // Outward normal -Y (becomes +Y when rotated PI around Z!)
        indices.push(a, b, c, b, d, c);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

/** Deforms both front & back face geometries smoothly along a physical page-turn arc */
function applyCurvedDeformation(
  sheet: TurningSheetRig,
  turn: number
): void {
  const t = Math.max(0, Math.min(1, turn));
  const theta = t * Math.PI;
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const smooth = 0.5 - 0.5 * cosT;
  const yBase = sheet.yRight + (sheet.yLeft - sheet.yRight) * smooth;

  const { PAGE_W, PAGE_H, SPINE_GAP, SEG_X, SEG_Z } = NB_DIMS;
  const cols = SEG_X + 1;
  const frontPos = sheet.frontMesh.geometry.attributes.position as THREE.BufferAttribute;
  const backPos = sheet.backMesh.geometry.attributes.position as THREE.BufferAttribute;

  const thick = 0.0014;

  for (let iz = 0; iz <= SEG_Z; iz++) {
    const z = -PAGE_H / 2 + (iz / SEG_Z) * PAGE_H;
    for (let ix = 0; ix <= SEG_X; ix++) {
      const u = ix / SEG_X;
      const r = SPINE_GAP + u * PAGE_W;

      // Outer edge trails gracefully while keeping alpha strictly in [0, PI] so zero downward clipping
      const lag = sinT * (u * u * 0.28);
      const alpha = Math.max(0, Math.min(Math.PI, theta - lag));

      const ca = Math.cos(alpha);
      const sa = Math.sin(alpha);

      // Gentle upward arch belly during mid-flip
      const liftY = sinT * Math.sin(u * Math.PI) * 0.095;
      const cx = r * ca;
      const cy = yBase + r * sa + liftY;

      const nx = -sa;
      const ny = ca;

      const idx = iz * cols + ix;
      frontPos.setXYZ(idx, cx + nx * thick, cy + ny * thick, z);
      backPos.setXYZ(idx, cx - nx * thick, cy - ny * thick, z);
    }
  }

  frontPos.needsUpdate = true;
  backPos.needsUpdate = true;
  sheet.frontMesh.geometry.computeVertexNormals();
  sheet.backMesh.geometry.computeVertexNormals();
  sheet.lastTurn = t;
}

function createSoftShadowDiscTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 12, 128, 128, 126);
  g.addColorStop(0, 'rgba(28, 18, 22, 0.22)');
  g.addColorStop(0.55, 'rgba(28, 18, 22, 0.09)');
  g.addColorStop(1, 'rgba(28, 18, 22, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function makeCanvasTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  isSoftwareGl: boolean
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = isSoftwareGl ? 1 : maxAnisotropy;
  tex.generateMipmaps = !isSoftwareGl;
  tex.minFilter = isSoftwareGl ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export function buildNotebookRig(
  maxAnisotropy: number,
  initialAssets: LoadedEditorialAssets,
  isSoftwareGl = false
): NotebookRig {
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const root = new THREE.Group();
  const paperNormal = track(createGrainNormalMap(9, 256));
  const cardstockNormal = track(createGrainNormalMap(13, 256));
  const edgeTex = track(createPageEdgeTexture());
  const shadowDiscTex = track(createSoftShadowDiscTexture());

  // 1. Studio Contact Shadow Discs (smooth cross-fade closed <-> open)
  const shadowMatClosed = track(
    new THREE.MeshBasicMaterial({
      map: shadowDiscTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })
  );
  const shadowGeo = track(new THREE.PlaneGeometry(1, 1));
  const contactShadowClosed = new THREE.Mesh(shadowGeo, shadowMatClosed);
  contactShadowClosed.rotation.x = -Math.PI / 2;
  contactShadowClosed.position.set(1.06, NB_DIMS.TABLE_Y + 0.001, 0.04);
  contactShadowClosed.scale.set(2.85, 3.65, 1);
  root.add(contactShadowClosed);

  const shadowMatOpen = track(
    new THREE.MeshBasicMaterial({
      map: shadowDiscTex,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    })
  );
  const contactShadowOpen = new THREE.Mesh(shadowGeo, shadowMatOpen);
  contactShadowOpen.rotation.x = -Math.PI / 2;
  contactShadowOpen.position.set(0, NB_DIMS.TABLE_Y + 0.001, 0.04);
  contactShadowOpen.scale.set(5.2, 3.8, 1);
  root.add(contactShadowOpen);

  // 2. Back Hardcover Board (stationary on studio table)
  const backCoverCanvas = document.createElement('canvas');
  drawHardcoverBackTexture(backCoverCanvas);
  const backCoverTex = track(makeCanvasTexture(backCoverCanvas, maxAnisotropy, isSoftwareGl));
  const backBoardGeo = track(
    createRoundedBoardGeometry(NB_DIMS.COVER_W, NB_DIMS.COVER_H, NB_DIMS.COVER_THICKNESS)
  );
  const cardstockMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: backCoverTex,
      normalMap: cardstockNormal,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughness: 0.78,
      metalness: 0.0,
      envMapIntensity: 0.05,
    })
  );
  const backCoverMesh = new THREE.Mesh(backBoardGeo, cardstockMat);
  backCoverMesh.position.set(0, NB_DIMS.BACK_COVER_CENTER_Y, 0);
  backCoverMesh.castShadow = true;
  backCoverMesh.receiveShadow = true;
  root.add(backCoverMesh);

  // 3. Dynamic Left & Right Paper Stack Thickness Blocks (hide +Y top face so stack edges NEVER occlude pages)
  const stackEdgeMat = track(
    new THREE.MeshStandardMaterial({
      map: edgeTex,
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      envMapIntensity: 0.05,
    })
  );
  const stackHiddenTopMat = track(new THREE.MeshBasicMaterial({ visible: false }));
  const stackMaterials = [
    stackEdgeMat,
    stackEdgeMat,
    stackHiddenTopMat,
    stackEdgeMat,
    stackEdgeMat,
    stackEdgeMat,
  ];
  const stackGeo = track(new THREE.BoxGeometry(NB_DIMS.PAGE_W - 0.04, 1, NB_DIMS.PAGE_H - 0.02));
  const rightStack = new THREE.Mesh(stackGeo, stackMaterials);
  rightStack.castShadow = true;
  rightStack.receiveShadow = true;
  root.add(rightStack);

  const leftStack = new THREE.Mesh(stackGeo, stackMaterials);
  leftStack.castShadow = true;
  leftStack.receiveShadow = true;
  root.add(leftStack);

  // 4. Static Back Base Sheet (Spread 04 Right — visible after sheet 3 flips)
  const backBaseCanvas = document.createElement('canvas');
  drawSpreadPageTexture(backBaseCanvas, 3, 'right', 0, initialAssets);
  const backBaseTexture = track(makeCanvasTexture(backBaseCanvas, maxAnisotropy, isSoftwareGl));
  const backBaseGeo = track(createPageFaceGeometry(NB_DIMS.PAGE_W, NB_DIMS.PAGE_H, 4, 4, false));
  const backBaseMat = track(
    new THREE.MeshStandardMaterial({
      map: backBaseTexture,
      normalMap: paperNormal,
      normalScale: new THREE.Vector2(0.18, 0.18),
      roughness: 0.98,
      metalness: 0.0,
      envMapIntensity: 0.0,
    })
  );
  const backBaseMesh = new THREE.Mesh(backBaseGeo, backBaseMat);
  backBaseMesh.position.set(0, -0.058, 0);
  backBaseMesh.receiveShadow = true;
  root.add(backBaseMesh);

  // 5. Front Hardcover Rig (pivots around spine x=0, y=COVER_PIVOT_Y)
  const coverPivot = new THREE.Group();
  coverPivot.position.set(0, NB_DIMS.COVER_PIVOT_Y, 0);
  root.add(coverPivot);

  const coverFrontCanvas = document.createElement('canvas');
  drawHardcoverFrontTexture(coverFrontCanvas, initialAssets);
  const coverFrontTexture = track(makeCanvasTexture(coverFrontCanvas, maxAnisotropy, isSoftwareGl));

  const frontBoardCanvas = document.createElement('canvas');
  drawHardcoverFrontBoardTexture(frontBoardCanvas);
  const frontBoardTex = track(makeCanvasTexture(frontBoardCanvas, maxAnisotropy, isSoftwareGl));
  const frontBoardMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: frontBoardTex,
      normalMap: cardstockNormal,
      normalScale: new THREE.Vector2(0.30, 0.30),
      roughness: 0.72,
      metalness: 0.0,
      envMapIntensity: 0.08,
    })
  );

  const frontBoardGeo = track(
    createRoundedBoardGeometry(NB_DIMS.COVER_W, NB_DIMS.COVER_H, NB_DIMS.COVER_THICKNESS)
  );
  const frontBoardMesh = new THREE.Mesh(frontBoardGeo, frontBoardMat);
  const coverCenterLocalY = 0.016 - NB_DIMS.COVER_PIVOT_Y; // +0.051
  frontBoardMesh.position.set(0, coverCenterLocalY, 0);
  frontBoardMesh.castShadow = true;
  frontBoardMesh.receiveShadow = true;
  coverPivot.add(frontBoardMesh);

  // Outer cover printed collage plane sitting flush on top of front cover (+Y)
  const coverRoughnessTex = track(createCoverMaterialRoughnessMap());
  const coverFrontOverlayGeo = track(
    createPageFaceGeometry(NB_DIMS.COVER_W - 0.06, NB_DIMS.COVER_H - 0.06, 4, 4, false)
  );
  const coverFrontOverlayMat = track(
    new THREE.MeshStandardMaterial({
      map: coverFrontTexture,
      roughnessMap: coverRoughnessTex,
      normalMap: cardstockNormal,
      normalScale: new THREE.Vector2(0.30, 0.30),
      roughness: 1.0,
      metalness: 0.0,
      envMapIntensity: 0.14,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    })
  );
  const coverFrontOverlay = new THREE.Mesh(coverFrontOverlayGeo, coverFrontOverlayMat);
  coverFrontOverlay.position.set(-0.02, coverCenterLocalY + NB_DIMS.COVER_THICKNESS / 2 + 0.004, 0);
  coverFrontOverlay.castShadow = false;
  coverFrontOverlay.receiveShadow = true;
  coverPivot.add(coverFrontOverlay);

  // Inner Front Cover Scrapbook Page = Spread 01 Left! (faces -Y locally, so +Y when coverPivot.rotation.z = PI!)
  const coverInnerCanvas = document.createElement('canvas');
  drawSpreadPageTexture(coverInnerCanvas, 0, 'left', 0, initialAssets);
  const coverInnerTexture = track(makeCanvasTexture(coverInnerCanvas, maxAnisotropy, isSoftwareGl));
  const coverInnerGeo = track(
    createPageFaceGeometry(NB_DIMS.PAGE_W, NB_DIMS.PAGE_H, 4, 4, true)
  );
  const coverInnerMat = track(
    new THREE.MeshStandardMaterial({
      map: coverInnerTexture,
      normalMap: paperNormal,
      normalScale: new THREE.Vector2(0.18, 0.18),
      roughness: 0.98,
      metalness: 0.0,
      envMapIntensity: 0.0,
    })
  );
  const coverInnerMesh = new THREE.Mesh(coverInnerGeo, coverInnerMat);
  coverInnerMesh.position.set(0, coverCenterLocalY - NB_DIMS.COVER_THICKNESS / 2 - 0.0045, 0);
  coverInnerMesh.receiveShadow = true;
  coverPivot.add(coverInnerMesh);

  // 6. 3 Curved Deformable Turning Sheets
  // Sheet 0: Front = Spread 1R | Back = Spread 2L
  // Sheet 1: Front = Spread 2R | Back = Spread 3L
  // Sheet 2: Front = Spread 3R | Back = Spread 4L
  const sheets: TurningSheetRig[] = [];
  for (let i = 0; i < 3; i++) {
    const group = new THREE.Group();
    const frontCanvas = document.createElement('canvas');
    drawSpreadPageTexture(frontCanvas, i, 'right', 0, initialAssets);
    const frontTexture = track(makeCanvasTexture(frontCanvas, maxAnisotropy, isSoftwareGl));

    const backCanvas = document.createElement('canvas');
    drawSpreadPageTexture(backCanvas, i + 1, 'left', 0, initialAssets);
    const backTexture = track(makeCanvasTexture(backCanvas, maxAnisotropy, isSoftwareGl));

    const frontGeo = track(
      createPageFaceGeometry(NB_DIMS.PAGE_W, NB_DIMS.PAGE_H, NB_DIMS.SEG_X, NB_DIMS.SEG_Z, false)
    );
    const backGeo = track(
      createPageFaceGeometry(NB_DIMS.PAGE_W, NB_DIMS.PAGE_H, NB_DIMS.SEG_X, NB_DIMS.SEG_Z, true)
    );

    const frontMat = track(
      new THREE.MeshStandardMaterial({
        map: frontTexture,
        normalMap: paperNormal,
        normalScale: new THREE.Vector2(0.18, 0.18),
        roughness: 0.98,
        metalness: 0.0,
        envMapIntensity: 0.0,
      })
    );
    const backMat = track(
      new THREE.MeshStandardMaterial({
        map: backTexture,
        normalMap: paperNormal,
        normalScale: new THREE.Vector2(0.18, 0.18),
        roughness: 0.98,
        metalness: 0.0,
        envMapIntensity: 0.0,
      })
    );

    const frontMesh = new THREE.Mesh(frontGeo, frontMat);
    frontMesh.castShadow = true;
    frontMesh.receiveShadow = true;

    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.castShadow = true;
    backMesh.receiveShadow = true;

    group.add(frontMesh, backMesh);
    root.add(group);

    const yRight = -0.008 - i * 0.015;
    const yLeft = -0.056 + i * 0.015;

    const sheetRig: TurningSheetRig = {
      group,
      frontMesh,
      backMesh,
      frontCanvas,
      frontTexture,
      backCanvas,
      backTexture,
      yRight,
      yLeft,
      lastTurn: -1,
    };
    applyCurvedDeformation(sheetRig, 0);
    sheets.push(sheetRig);
  }

  // 7. Realistic Metallic Double-Loop Wire-O Binding (9 twin-wire pairs = 18 coils)
  const wireMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xd8dce4,
      metalness: 0.92,
      roughness: 0.18,
      envMapIntensity: 1.45,
    })
  );

  // Build single twin-loop C-ring curve around spine axis (x = 0, y = -0.018)
  // Top reaches +0.088 (clears closed cover +0.040), bottom reaches -0.124 (wraps below back cover -0.110)
  const rx = 0.136;
  const ry = 0.106;
  const ringCenterY = -0.018;
  const loopPts: THREE.Vector3[] = [];
  const arcSteps = 26;
  for (let s = 0; s < arcSteps; s++) {
    const ang = (s / arcSteps) * Math.PI * 2;
    loopPts.push(new THREE.Vector3(Math.cos(ang) * rx, ringCenterY + Math.sin(ang) * ry, 0));
  }
  const ringCurve = new THREE.CatmullRomCurve3(loopPts, true);
  const singleRingGeo = track(new THREE.TubeGeometry(ringCurve, 32, 0.0125, 10, true));

  const ringCount = RING_NORMALIZED_Z.length * 2;
  const wireInstanced = new THREE.InstancedMesh(singleRingGeo, wireMat, ringCount);
  wireInstanced.castShadow = true;
  wireInstanced.receiveShadow = true;

  const dummy = new THREE.Object3D();
  let instanceIdx = 0;
  for (const nz of RING_NORMALIZED_Z) {
    const zCenter = -NB_DIMS.PAGE_H / 2 + nz * NB_DIMS.PAGE_H;
    for (const dz of [-0.021, 0.021]) {
      dummy.position.set(0, 0, zCenter + dz);
      dummy.updateMatrix();
      wireInstanced.setMatrixAt(instanceIdx++, dummy.matrix);
    }
  }
  wireInstanced.instanceMatrix.needsUpdate = true;
  root.add(wireInstanced);

  const lastSpreadAnim = [-1, -1, -1, -1];

  const updateCoverTurn = (coverTurn: number) => {
    const t = Math.max(0, Math.min(1, coverTurn));
    coverPivot.rotation.z = t * Math.PI;
    shadowMatClosed.opacity = 0.92 * (1 - t);
    shadowMatOpen.opacity = 0.85 * t;
  };

  const updateSheetTurn = (index: number, turn: number) => {
    const sheet = sheets[index];
    if (!sheet) return;
    if (Math.abs(sheet.lastTurn - turn) < 0.0004) return;
    applyCurvedDeformation(sheet, turn);
  };

  const updateStacks = (
    leftRatio: number,
    rightRatio: number,
    coverTurn: number,
    sheetTurns: [number, number, number] = [0, 0, 0]
  ) => {
    const anyMidTurn = sheetTurns.some((t) => t > 0.02 && t < 0.98);
    let rightTopY = -0.010;
    if (sheetTurns[2] > 0.005) rightTopY = -0.056;
    else if (sheetTurns[1] > 0.005) rightTopY = -0.041;
    else if (sheetTurns[0] > 0.005) rightTopY = -0.026;
    else rightTopY = -0.059 + rightRatio * 0.049;

    const rH = Math.max(0.005, rightTopY - NB_DIMS.STACK_BASE_Y);
    rightStack.visible = !anyMidTurn && coverTurn > 0.02 && rightRatio > 0.02;
    rightStack.scale.y = rH;
    rightStack.position.set(NB_DIMS.SPINE_GAP + NB_DIMS.PAGE_W / 2 - 0.018, NB_DIMS.STACK_BASE_Y + rH / 2, 0);

    const leftTopY = -0.061 + leftRatio * 0.040;
    const lH = Math.max(0.004, leftTopY - NB_DIMS.STACK_BASE_Y);
    leftStack.visible = !anyMidTurn && coverTurn > 0.45 && leftRatio > 0.02;
    leftStack.scale.y = lH;
    leftStack.position.set(-(NB_DIMS.SPINE_GAP + NB_DIMS.PAGE_W / 2 - 0.018), NB_DIMS.STACK_BASE_Y + lH / 2, 0);
  };

  const repaintAllStatic = (assets: LoadedEditorialAssets) => {
    drawHardcoverFrontTexture(coverFrontCanvas, assets);
    coverFrontTexture.needsUpdate = true;

    for (let i = 0; i < 4; i++) {
      lastSpreadAnim[i] = -1;
      updateSpreadAnimTexture(i, 0, assets);
    }
  };

  const updateSpreadAnimTexture = (
    spreadIndex: number,
    anim: number,
    assets: LoadedEditorialAssets
  ): boolean => {
    const prev = lastSpreadAnim[spreadIndex];
    if (prev >= 0 && Math.abs(anim - prev) < 0.035 && !(anim === 0 && prev !== 0) && !(anim === 1 && prev !== 1)) {
      return false;
    }
    lastSpreadAnim[spreadIndex] = anim;

    if (spreadIndex === 0) {
      drawSpreadPageTexture(coverInnerCanvas, 0, 'left', anim, assets);
      coverInnerTexture.needsUpdate = true;
      drawSpreadPageTexture(sheets[0].frontCanvas, 0, 'right', anim, assets);
      sheets[0].frontTexture.needsUpdate = true;
    } else if (spreadIndex === 1 || spreadIndex === 2) {
      drawSpreadPageTexture(sheets[spreadIndex - 1].backCanvas, spreadIndex, 'left', anim, assets);
      sheets[spreadIndex - 1].backTexture.needsUpdate = true;
      drawSpreadPageTexture(sheets[spreadIndex].frontCanvas, spreadIndex, 'right', anim, assets);
      sheets[spreadIndex].frontTexture.needsUpdate = true;
    } else if (spreadIndex === 3) {
      drawSpreadPageTexture(sheets[2].backCanvas, 3, 'left', anim, assets);
      sheets[2].backTexture.needsUpdate = true;
      drawSpreadPageTexture(backBaseCanvas, 3, 'right', anim, assets);
      backBaseTexture.needsUpdate = true;
    }
    return true;
  };

  updateCoverTurn(0);
  updateStacks(0, 1, 0);

  return {
    root,
    coverPivot,
    coverFrontCanvas,
    coverFrontTexture,
    coverInnerCanvas,
    coverInnerTexture,
    sheets,
    backBaseCanvas,
    backBaseTexture,
    leftStack,
    rightStack,
    contactShadowClosed,
    contactShadowOpen,
    disposables,
    updateCoverTurn,
    updateSheetTurn,
    updateStacks,
    repaintAllStatic,
    updateSpreadAnimTexture,
  };
}
