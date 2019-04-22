// https://tools.ietf.org/html/rfc4122

export class UUID {
  static version: number = 1; // 4 bit
  static clock: number = Math.floor(Math.random() * 0xffffffff); // counter // 32bits (-1)
  static node: number = Math.floor(Math.random() * (2 ** 48)); // MAC address // 48bits

  static get(): string {
    this.clock++;
    const timestamp: number = Date.now();
    const time_low: number = (timestamp & 0xffffffff) >>> 0;
    const time_mid: number = ((timestamp >> 32) & 0xffff) >>> 0;
    const time_hi_and_version: number = (((timestamp >> 48) & 0xfff0) | (this.version & 0x000f)) >>> 0;
    const clock_seq_low: number = this.clock & 0xff;
    const clock_seq_hi_and_reserved: number = ((( this.clock >> 8) & 0b00111111) | 0b01000000);
    const node: number = Math.floor(Math.random() * (2 ** 48)); // this.node

    return this.toHex(time_low, 8) + '-' +
      this.toHex(time_mid, 4) + '-' +
      this.toHex(time_hi_and_version, 4) + '-' +
      this.toHex(clock_seq_hi_and_reserved, 2) + this.toHex(clock_seq_low, 2) + '-' +
      this.toHex(node, 12)
      ;
  }

  static toHex(value: number, size: number): string {
    let output: string = value.toString(16);
    output = '0'.repeat(Math.max(0, size - output.length)) + output;
    return output;
  }
}
