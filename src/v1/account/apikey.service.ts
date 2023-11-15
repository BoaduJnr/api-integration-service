export class GenerateAPIKey {
  private async generateRandomString(length: number): Promise<string> {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*+=';
    let randomString = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }

  private async generateChecksum(input: string) {
    // Generate the checksum logic here (e.g., based on the input)
    // we'll use a simple hash of the input
    const checksum = input
      .split('')
      .map((char) => char.charCodeAt(0))
      .reduce((a, b) => a + b, 0)
      .toString()
      .slice(-4);

    return checksum;
  }

  async generateRandomStringWithChecksum() {
    const randomPartLength = 18;

    const randomPart = await this.generateRandomString(randomPartLength);
    const checksum = await this.generateChecksum(randomPart);

    return `${randomPart}_${checksum}`;
  }
  async validateChecksum(randomStringWithChecksum: string) {
    // Split the input string into the random part and the provided checksum
    const [randomPart, providedChecksum] = randomStringWithChecksum.split('_');

    // Generate the checksum for the random part using the same logic
    const recreatedChecksum = await this.generateChecksum(randomPart);

    return recreatedChecksum === providedChecksum;
  }
}
