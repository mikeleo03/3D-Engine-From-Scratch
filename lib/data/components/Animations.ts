import fs from 'fs';
import path from 'path';
import {SceneNode} from "@/lib/data/SceneNode";
import {Quaternion, Vector3} from "@/lib/data/math";

export type AnimationTRS = {
  translation?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export type AnimationPath = {
  keyframe?: AnimationTRS;
  children?: {
    [childName: string]: AnimationPath;
  }
}

export type AnimationClip = {
  name: string;
  frames: AnimationPath[];
}

// CONTOH PENGGUNAAN DARI GUIDEBOOK
// const testAnim: AnimationClip = {
//   name: "Fox Walking",
//   frames: [
//     // 0
//     {
//       keyframe: {
//         translation: [-0.5, 0, 0],
//         rotation: [0, 0, 0],
//       },
//       children: {
//         RHead: {
//           keyframe: {
//             translation: [0.75, 1.5, 0],
//             rotation: [0, 0, 0],
//           },
//         },
//         RTail: {
//           keyframe: {
//             translation: [-0.75, 1.5, 0],
//             rotation: [0, 30, 0],
//           },
//           children: {
//             RTailTip: {
//               keyframe: {
//                 translation: [-0.5, 0, 0],
//                 rotation: [0, 0, 0],
//               },
//             }
//           }
//         }
//       },
//     },
//     // 1
//     {
//       keyframe: {
//         translation: [-0.5, 0, 0],
//         rotation: [0, 0.5, 0],
//       },
//       children: {
//         RHead: {
//           keyframe: {
//             translation: [0.75, 1.5, 0],
//             rotation: [0, 0, 0],
//           },
//         },
//       },
//     },
//   ],
// };

export class AnimationRunner {
  isPlaying: boolean = false;
  fps: number = 30;
  private root: SceneNode;
  private currentFrame: number = 0;
  private deltaFrame: number = 0;
  private currentAnimation?: AnimationClip;

  constructor(animFile: string, root: SceneNode, {fps=30} = {}) {
    this.currentAnimation = this.load(animFile);
    this.fps = fps;
    this.root = root;
  }

  get CurrentFrame() {
    return this.currentFrame;
  }

  get length() {
    return this.currentAnimation!.frames.length;
  }

  private get frame() {
    return this.currentAnimation!.frames[this.currentFrame];
  }

  update(deltaSecond: number) {
    if (this.isPlaying) {
      this.deltaFrame += deltaSecond * this.fps;
      if (this.deltaFrame >= 1) {
        this.currentFrame = (this.currentFrame + Math.floor(this.deltaFrame)) % this.length;
        this.deltaFrame = this.deltaFrame % 1;
        this.updateSceneGraph();
      }
    }
  }

  private updateSceneGraph() {
    // update the scene graph based on the current frame
    const frame = this.frame;
    // use root as the parent and traverse according to the frame
    this.traverseAndUpdate(this.root, frame);
  }

  private traverseAndUpdate(node: SceneNode, frame: AnimationPath) {
    // update the node based on the frame
    if (frame.keyframe) {
      if (frame.keyframe.translation) {
        node.position = new Vector3(frame.keyframe.translation[0], frame.keyframe.translation[1], frame.keyframe.translation[2]);
      }
      if (frame.keyframe.rotation) {
        const eulerVec = new Vector3(frame.keyframe.rotation[0], frame.keyframe.rotation[1], frame.keyframe.rotation[2]);
        node.rotation = Quaternion.fromEuler(eulerVec);
      }
      if (frame.keyframe.scale) {
        node.scale = new Vector3(frame.keyframe.scale[0], frame.keyframe.scale[1], frame.keyframe.scale[2]);
      }
    }

    // recursive approach to apply the frame to the children
    if (frame.children) {
      for (const childName in frame.children) {
        const child = node.children.find(child => child.name === childName);
        if (child) {
          this.traverseAndUpdate(child, frame.children[childName]);
        }
      }
    }
  }

  private load(animFile: string): AnimationClip | undefined {
    try {
      const filePath = path.resolve(__dirname, animFile);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}
