/**
 * 7D Multi-Channel Steganography
 * Implements hiding data across 7 dimensions:
 * X, Y (position), Z (layer), T (time), C (color), A (alpha), F (frequency)
 */

export class SteganographyChannels {
  /**
   * Channel 1: Path Coordinates (X, Y positions with micro-precision)
   * Hides data in LSB of path coordinates
   */
  static hideInCoords(pathData, data, precision = 0.001) {
    let dataIndex = 0;
    const result = [];

    for (const cmd of pathData) {
      const newCmd = { ...cmd };

      if (cmd.type === 'M' || cmd.type === 'L') {
        if (dataIndex < data.length) {
          // Hide in micro-precision of x coordinate
          newCmd.x = cmd.x + (data[dataIndex] / 255) * precision;
          dataIndex++;
        }
        if (dataIndex < data.length) {
          // Hide in micro-precision of y coordinate
          newCmd.y = cmd.y + (data[dataIndex] / 255) * precision;
          dataIndex++;
        }
      } else if (cmd.type === 'C') {
        // Cubic bezier - hide in control points
        if (dataIndex < data.length) {
          newCmd.x1 = cmd.x1 + (data[dataIndex++] / 255) * precision;
        }
        if (dataIndex < data.length) {
          newCmd.y1 = cmd.y1 + (data[dataIndex++] / 255) * precision;
        }
        if (dataIndex < data.length) {
          newCmd.x2 = cmd.x2 + (data[dataIndex++] / 255) * precision;
        }
        if (dataIndex < data.length) {
          newCmd.y2 = cmd.y2 + (data[dataIndex++] / 255) * precision;
        }
        if (dataIndex < data.length) {
          newCmd.x = cmd.x + (data[dataIndex++] / 255) * precision;
        }
        if (dataIndex < data.length) {
          newCmd.y = cmd.y + (data[dataIndex++] / 255) * precision;
        }
      }

      result.push(newCmd);
    }

    return { result, bytesUsed: dataIndex };
  }

  static extractFromCoords(pathData, precision = 0.001) {
    const data = [];

    for (const cmd of pathData) {
      if (cmd.type === 'M' || cmd.type === 'L') {
        const xMicro = cmd.x - Math.floor(cmd.x);
        const yMicro = cmd.y - Math.floor(cmd.y);
        data.push(Math.round((xMicro / precision) * 255) % 256);
        data.push(Math.round((yMicro / precision) * 255) % 256);
      } else if (cmd.type === 'C') {
        const x1Micro = cmd.x1 - Math.floor(cmd.x1);
        const y1Micro = cmd.y1 - Math.floor(cmd.y1);
        const x2Micro = cmd.x2 - Math.floor(cmd.x2);
        const y2Micro = cmd.y2 - Math.floor(cmd.y2);
        const xMicro = cmd.x - Math.floor(cmd.x);
        const yMicro = cmd.y - Math.floor(cmd.y);

        data.push(Math.round((x1Micro / precision) * 255) % 256);
        data.push(Math.round((y1Micro / precision) * 255) % 256);
        data.push(Math.round((x2Micro / precision) * 255) % 256);
        data.push(Math.round((y2Micro / precision) * 255) % 256);
        data.push(Math.round((xMicro / precision) * 255) % 256);
        data.push(Math.round((yMicro / precision) * 255) % 256);
      }
    }

    return new Uint8Array(data);
  }

  /**
   * Channel 2: RGB Color LSB
   * Hides data in least significant bits of RGB values
   */
  static hideInRGB(colors, data) {
    let dataIndex = 0;
    const result = [];

    for (let color of colors) {
      if (dataIndex >= data.length) {
        result.push(color);
        continue;
      }

      // Parse hex color #RRGGBB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      // Hide 2 bits in each channel (LSB)
      const byte = data[dataIndex++];
      const newR = (r & 0xFC) | ((byte >> 6) & 0x03);
      const newG = (g & 0xFC) | ((byte >> 4) & 0x03);
      const newB = (b & 0xFC) | ((byte >> 2) & 0x03);

      const newColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
      result.push(newColor);
    }

    return { result, bytesUsed: dataIndex };
  }

  static extractFromRGB(colors) {
    const data = [];

    for (const color of colors) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      const byte = ((r & 0x03) << 6) | ((g & 0x03) << 4) | ((b & 0x03) << 2);
      data.push(byte);
    }

    return new Uint8Array(data);
  }

  /**
   * Channel 3: Opacity/Alpha
   * Hides data in alpha channel (subtle variations)
   */
  static hideInAlpha(baseOpacity, data) {
    const result = [];

    for (let i = 0; i < data.length; i++) {
      // Vary opacity between 0.95 and 1.0 based on data
      const opacity = baseOpacity - (data[i] / 255) * 0.05;
      result.push(Math.max(0, Math.min(1, opacity)));
    }

    return result;
  }

  static extractFromAlpha(opacities, baseOpacity = 1.0) {
    const data = [];

    for (const opacity of opacities) {
      const delta = baseOpacity - opacity;
      const byte = Math.round((delta / 0.05) * 255);
      data.push(Math.max(0, Math.min(255, byte)));
    }

    return new Uint8Array(data);
  }

  /**
   * Channel 4: Transform Matrix
   * Hides data in transformation matrix parameters (translation)
   */
  static hideInTransform(baseTransforms, data) {
    const result = [];
    let dataIndex = 0;

    for (const transform of baseTransforms) {
      if (dataIndex >= data.length) {
        result.push(transform);
        continue;
      }

      // Hide in translation parameters (e, f in matrix)
      const tx = transform.tx + (data[dataIndex++] / 255) * 0.1;
      const ty = dataIndex < data.length
        ? transform.ty + (data[dataIndex++] / 255) * 0.1
        : transform.ty;

      result.push({ ...transform, tx, ty });
    }

    return { result, bytesUsed: dataIndex };
  }

  static extractFromTransform(transforms) {
    const data = [];

    for (const transform of transforms) {
      const txMicro = transform.tx - Math.floor(transform.tx);
      const tyMicro = transform.ty - Math.floor(transform.ty);

      data.push(Math.round((txMicro / 0.1) * 255) % 256);
      data.push(Math.round((tyMicro / 0.1) * 255) % 256);
    }

    return new Uint8Array(data);
  }

  /**
   * Channel 5: Gradient Stop Positions
   * Hides data in gradient stop offsets
   */
  static hideInGradient(numStops, data) {
    const stops = [];

    for (let i = 0; i < numStops && i < data.length; i++) {
      const baseOffset = i / (numStops - 1);
      const microOffset = (data[i] / 255) * 0.01;
      stops.push({
        offset: Math.max(0, Math.min(1, baseOffset + microOffset)),
        color: `hsl(${(i / numStops) * 360}, 70%, 60%)`
      });
    }

    return stops;
  }

  static extractFromGradient(stops) {
    const data = [];

    for (let i = 0; i < stops.length; i++) {
      const baseOffset = i / (stops.length - 1);
      const microOffset = stops[i].offset - baseOffset;
      const byte = Math.round((microOffset / 0.01) * 255);
      data.push(Math.max(0, Math.min(255, byte)));
    }

    return new Uint8Array(data);
  }

  /**
   * Channel 6: Stroke Width
   * Hides data in stroke width variations
   */
  static hideInStroke(baseWidth, data) {
    const result = [];

    for (let i = 0; i < data.length; i++) {
      const width = baseWidth + (data[i] / 255) * 0.5;
      result.push(width);
    }

    return result;
  }

  static extractFromStroke(widths, baseWidth) {
    const data = [];

    for (const width of widths) {
      const delta = width - baseWidth;
      const byte = Math.round((delta / 0.5) * 255);
      data.push(Math.max(0, Math.min(255, byte)));
    }

    return new Uint8Array(data);
  }

  /**
   * Channel 7: Animation Timing
   * Hides data in animation duration and begin times
   */
  static hideInTiming(baseBegin, baseDur, data) {
    const animations = [];

    for (let i = 0; i < data.length; i += 2) {
      const beginDelta = (data[i] / 255) * 0.1;
      const durDelta = (i + 1 < data.length)
        ? (data[i + 1] / 255) * 0.5
        : 0;

      animations.push({
        begin: baseBegin + beginDelta,
        dur: baseDur + durDelta
      });
    }

    return animations;
  }

  static extractFromTiming(animations, baseBegin, baseDur) {
    const data = [];

    for (const anim of animations) {
      const beginDelta = anim.begin - baseBegin;
      const durDelta = anim.dur - baseDur;

      data.push(Math.round((beginDelta / 0.1) * 255) % 256);
      data.push(Math.round((durDelta / 0.5) * 255) % 256);
    }

    return new Uint8Array(data);
  }
}
