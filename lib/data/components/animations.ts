import {SceneNode} from "@/lib/data/SceneNode";
import {Quaternion, Vector3} from "@/lib/data/math";
import { GLTFParser } from "@/lib/data/GLTFParser";
import { AnimationClipType, AnimationPathType, AnimationTRS } from '../types/gltftypes';


export type AnimationPath = {
  nodeKeyframePairs?: Array<{node: SceneNode, keyframe: AnimationTRS}>
}

export type AnimationClip = {
  name: string;
  frames: AnimationPath[];
}

export class AnimationPathUtil {
  static fromRaw(raw: AnimationPathType, nodes: SceneNode[]): AnimationPath {
    return {
      nodeKeyframePairs: raw.nodeKeyframePairs ? raw.nodeKeyframePairs.map(pair => ({node: nodes[pair.node], keyframe: pair.keyframe})) : undefined,
    }
  }

  static toRaw(path: AnimationPath, nodeMap: Map<SceneNode, number>): AnimationPathType {
    const nodeKeyframePairs = path.nodeKeyframePairs ? path.nodeKeyframePairs.map(pair => ({node: nodeMap.get(pair.node)!!, keyframe: pair.keyframe})) : undefined;
    return {
      nodeKeyframePairs: nodeKeyframePairs
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
  LINEAR = 'Linear',
  SINE = 'Sine',
  QUAD = 'Quad',
  CUBIC = 'Cubic',
  QUART = 'Quart',
  EXPO = 'Expo',
  CIRC = 'Circ',
  NONE = 'None'
}

export class AnimationRunner {
  isPlaying: boolean = false;
  isReverse: boolean = false;
  isLoop: boolean = false;
  fps: number = 30;
  easeFunction: EasingFunction = EasingFunction.NONE;
  private currentFrame: number = 0;
  private deltaFrame: number = 0;
  private currentAnimation?: AnimationClip;
  private lastUpdate: number;
  private t: number; // for tweening

  constructor({fps = 20} = {}) {
    this.fps = fps;
    this.lastUpdate = Date.now();
  }

  get CurrentFrame() {
    return this.currentFrame;
  }

  get length() {
    return this.currentAnimation ? this.currentAnimation.frames.length : 0;
  }

  public setIsPlaying(isPlaying: boolean) {
    this.isPlaying = isPlaying;

    if (isPlaying) {
      this.lastUpdate = Date.now();
    }
  }

  public setAnimation(animation: AnimationClip) {
    this.currentAnimation = animation;
    this.currentFrame = 0;
    this.deltaFrame = 0;

    const firstFrame = this.currentAnimation.frames[0];
    if (firstFrame.nodeKeyframePairs) {
      for (let pair of firstFrame.nodeKeyframePairs) {
        const node = pair.node;
        const keyframe = pair.keyframe;

        if (keyframe.translation) {
          node.position = new Vector3(keyframe.translation[0], keyframe.translation[1], keyframe.translation[2]);
        }
        if (keyframe.rotation) {
          node.rotation = Quaternion.fromDegrees(keyframe.rotation[0], keyframe.rotation[1], keyframe.rotation[2]);
        }
        if (keyframe.scale) {
          node.scale = new Vector3(keyframe.scale[0], keyframe.scale[1], keyframe.scale[2]);
        }
      }
    }
  }

  public setEasingFunction(easeFunction: string){
    this.easeFunction = easeFunction as EasingFunction;
  }

  private get frame() {
    return this.currentAnimation!.frames[this.currentFrame];
  }

  nextFrame() {
    if (this.currentFrame < this.length - 1) {
      this.currentFrame++;
      this.updateCurrentNode();
      this.deltaFrame = 0;
    }
  }

  prevFrame() {
    if (this.currentFrame > 0) {
      this.currentFrame--;
      this.updateCurrentNode();
      this.deltaFrame = 0;
    }
  }

  firstFrame() {
    this.currentFrame = 0;
    const firstFrame = this.currentAnimation?.frames[0];
    if (firstFrame?.nodeKeyframePairs) {
      for (let pair of firstFrame.nodeKeyframePairs) {
        const node = pair.node;
        const keyframe = pair.keyframe;

        if (keyframe.translation) {
          node.position = new Vector3(keyframe.translation[0], keyframe.translation[1], keyframe.translation[2]);
        }
        if (keyframe.rotation) {
          node.rotation = Quaternion.fromDegrees(keyframe.rotation[0], keyframe.rotation[1], keyframe.rotation[2]);
        }
        if (keyframe.scale) {
          node.scale = new Vector3(keyframe.scale[0], keyframe.scale[1], keyframe.scale[2]);
        }
      }
    }
    this.deltaFrame = 0;
  }

  lastFrame() {
    this.currentFrame = this.length - 1;
    const lastFrame = this.currentAnimation?.frames[this.length - 1];
    if (lastFrame?.nodeKeyframePairs) {
      for (let pair of lastFrame.nodeKeyframePairs) {
        const node = pair.node;
        const keyframe = pair.keyframe;

        if (keyframe.translation) {
          node.position = new Vector3(keyframe.translation[0], keyframe.translation[1], keyframe.translation[2]);
        }
        if (keyframe.rotation) {
          node.rotation = Quaternion.fromDegrees(keyframe.rotation[0], keyframe.rotation[1], keyframe.rotation[2]);
        }
        if (keyframe.scale) {
          node.scale = new Vector3(keyframe.scale[0], keyframe.scale[1], keyframe.scale[2]);
        }
      }
    }
    this.deltaFrame = 0;
  }

  update() {
    if (this.isPlaying) {
      const now = Date.now();
      const elapsed = now - this.lastUpdate;
      if (elapsed >= 1000 / this.fps) {
        this.lastUpdate = now;
        this.deltaFrame += elapsed / 1000 * this.fps;

        if (this.isReverse){
          this.deltaFrame *= -1;
        }

        this.t = this.deltaFrame / (1000 / this.fps);

        if (this.deltaFrame > 0) {
          if (this.currentFrame < this.length - 1) {
            this.nextFrame();
          } else if (this.isLoop) {
            this.firstFrame();
          } else {
            this.isPlaying = false;
            return false;
          }
        } else if (this.deltaFrame < 0) {
          if (this.currentFrame > 0) {
            this.prevFrame();
          } else if (this.isLoop) {
            this.lastFrame();
          } else {
            this.isPlaying = false;
            return false;
          }
        }
      }
      return true;
    }
  }

  private updateCurrentNode() {
    // update the scene graph based on the current frame
    const currentFrame = this.frame;
    let nextFrameIndex = this.isReverse ? this.currentFrame - 1 : this.currentFrame + 1;

    if (this.isLoop) {
      if (nextFrameIndex < 0) {
        nextFrameIndex = this.length - 1;
      } else if (nextFrameIndex >= this.length) {
        nextFrameIndex = 0;
      }
    }

    const nextFrame = this.currentAnimation!.frames[nextFrameIndex];
    this.updateFrame(currentFrame, nextFrame, this.t);
  }

  private updateFrame(currentFrame: AnimationPath, nextFrame: AnimationPath | undefined, t: number) {
    if (currentFrame.nodeKeyframePairs && nextFrame && nextFrame.nodeKeyframePairs && this.easeFunction != EasingFunction.NONE) {
      for (let i = 0; i < currentFrame.nodeKeyframePairs.length; i++) {
        const currentNodePair = currentFrame.nodeKeyframePairs[i];
        const nextNodePair = nextFrame.nodeKeyframePairs[i];

        const node = currentNodePair.node;
        const currentKeyframe = currentNodePair.keyframe;
        const nextKeyframe = nextNodePair.keyframe;

        if (currentKeyframe.translation && nextKeyframe.translation) {
          node.position = new Vector3(
            this.ease(currentKeyframe.translation[0], nextKeyframe.translation[0], t),
            this.ease(currentKeyframe.translation[1], nextKeyframe.translation[1], t),
            this.ease(currentKeyframe.translation[2], nextKeyframe.translation[2], t)
          );
        }

        if (currentKeyframe.rotation && nextKeyframe.rotation) {
          const easedZ = this.ease(currentKeyframe.rotation[2], nextKeyframe.rotation[2], t);
          node.rotation = Quaternion.fromDegrees(
            this.ease(currentKeyframe.rotation[0], nextKeyframe.rotation[0], t),
            this.ease(currentKeyframe.rotation[1], nextKeyframe.rotation[1], t),
            this.ease(currentKeyframe.rotation[2], nextKeyframe.rotation[2], t)
          );
        }

        if (currentKeyframe.scale && nextKeyframe.scale) {
          node.scale = new Vector3(
            this.ease(currentKeyframe.scale[0], nextKeyframe.scale[0], t),
            this.ease(currentKeyframe.scale[1], nextKeyframe.scale[1], t),
            this.ease(currentKeyframe.scale[2], nextKeyframe.scale[2], t)
          );
        }
      }
    }

    else if (currentFrame.nodeKeyframePairs) {
      for (let pair of currentFrame.nodeKeyframePairs) {
        const node = pair.node;
        const keyframe = pair.keyframe;

        if (keyframe.translation) {
          node.position = new Vector3(keyframe.translation[0], keyframe.translation[1], keyframe.translation[2]);
        }
        if (keyframe.rotation) {
          node.rotation = Quaternion.fromDegrees(keyframe.rotation[0], keyframe.rotation[1], keyframe.rotation[2]);
        }
        if (keyframe.scale) {
          node.scale = new Vector3(keyframe.scale[0], keyframe.scale[1], keyframe.scale[2]);
        }
      }
    }
  }

  private ease(start: number, end: number, t: number) {
    switch (this.easeFunction) {
      case EasingFunction.SINE:
        return start + (end - start) * Math.sin(1 - Math.cos(t * Math.PI / 2));
      case EasingFunction.QUAD:
        return start + (end - start) * Math.pow(t, 2);
      case EasingFunction.CUBIC:
        return start + (end - start) * Math.pow(t, 3);
      case EasingFunction.QUART:
        return start + (end - start) * Math.pow(t, 4);
      case EasingFunction.EXPO:
        return start + (end - start) * Math.pow(2, 10 * (t - 1));
      case EasingFunction.CIRC:
        return start + (end - start) * (1 - Math.sqrt(1 - Math.pow(t, 2)));
      default: // LINEAR
        return start + (end - start) * t;
    }
  }
}
