import {SceneNode} from "@/lib/data/SceneNode";
import {Quaternion, Vector3} from "@/lib/data/math";
import { AnimationClipType, AnimationPathType, AnimationTRS } from '../types/gltftypes';


export type AnimationPath = {
  keyframe?: AnimationTRS;
  children?: SceneNode[];
}

export type AnimationClip = {
  name: string;
  frames: AnimationPath[];
}

export class AnimationPathUtil {
  static fromRaw(raw: AnimationPathType, nodes: SceneNode[]): AnimationPath {
      return {
        keyframe: raw.keyframe,
        children: raw.children ? raw.children.map(child => nodes[child]) : undefined,
      }
  }

  static toRaw(path: AnimationPath, nodeMap: Map<SceneNode, number>): AnimationPathType {
    const children = path.children ? path.children.map(child => nodeMap.get(child)!!) : undefined;
    return {
      keyframe: path.keyframe,
      children: children
    }
  }

}

export class AnimationClipUtil {
  static fromRaw(raw: AnimationClipType, nodes: SceneNode[]): AnimationClip {
    return {
      name: raw.name,
      frames: raw.frames.map(frame => AnimationPathUtil.fromRaw(frame, nodes)),
    }
  }

  static toRaw(clip: AnimationClip, nodeMap: Map<SceneNode, number>): AnimationClipType {
    return {
      name: clip.name,
      frames: clip.frames.map(frame => AnimationPathUtil.toRaw(frame, nodeMap)),
    }
  }
}

export enum EasingFunction {
  LINEAR = 'linear',
  SINE = 'sine',
  QUAD = 'quad',
  CUBIC = 'cubic',
  QUART = 'quart',
  EXPO = 'expo',
  CIRC = 'circ',
}

export class AnimationRunner {
  isPlaying: boolean = false;
  fps: number = 30;
  easeFunction: EasingFunction = EasingFunction.LINEAR;
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

  // TODO: verify the implementation of this function
  private calculateEasing(currentTime: number, startValue: number, changeInValue: number, duration: number): number {
    switch (this.easeFunction) {
      case EasingFunction.SINE:
        return changeInValue * Math.sin(currentTime / duration * Math.PI / 2) + startValue;
      case EasingFunction.QUAD:
        return changeInValue * (currentTime /= duration) * currentTime + startValue;
      case EasingFunction.CUBIC:
        return changeInValue * ((currentTime = currentTime / duration - 1) * currentTime * currentTime + 1) + startValue;
      case EasingFunction.QUART:
        return changeInValue * ((currentTime = currentTime / duration - 1) * currentTime * currentTime * currentTime + 1) + startValue;
      case EasingFunction.EXPO:
        return changeInValue * Math.pow(2, 10 * (currentTime / duration - 1)) + startValue;
      case EasingFunction.CIRC:
        return changeInValue * (1 - Math.sqrt(1 - (currentTime /= duration) * currentTime)) + startValue;
      default: // linear
        return changeInValue * currentTime / duration + startValue;
    }
  }

  update(deltaSecond: number) {
    if (this.isPlaying) {
      this.deltaFrame = this.calculateEasing(this.deltaFrame + deltaSecond, 0, 1, this.length)
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
    if (frame.children && node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const childFrame = frame.children[i];
        if (child && childFrame) {
          this.traverseAndUpdate(child, childFrame);
        }
      }
    }
  }

  // TODO: find alternative way to implement this (i guess toraw and fromraw of John's code)
  // private load(animFile: string): AnimationClip | undefined {
  //   try {
  //     const filePath = path.resolve(__dirname, animFile);
  //     const fileContent = fs.readFileSync(filePath, 'utf-8');
  //     return JSON.parse(fileContent);
  //   } catch (e) {
  //     console.error(e);
  //     return undefined;
  //   }
  // }

  // stub for now
  private load(animFile: string): AnimationClip {
    return {
      name: "Stub Animation",
      frames: [
        // 0
        {
          keyframe: {
            translation: [-0.5, 0, 0],
            rotation: [0, 0, 0],
          },
          children: [
            new SceneNode(new Vector3(0.5, 0, 0), new Quaternion(0, 0, 0, 1), new Vector3(1, 1, 1)),
          ],
        }
      ],
    };
  }
}
