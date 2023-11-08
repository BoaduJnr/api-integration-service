export class GenerateAPIKey {
  private generateRandomString(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*+=';
    let randomString = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }

  private generateChecksum(input: string): string {
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

  generateRandomStringWithChecksum(): string {
    const randomPartLength = 18;

    const randomPart = this.generateRandomString(randomPartLength);
    const checksum = this.generateChecksum(randomPart);

    return `${randomPart}_${checksum}`;
  }
  validateChecksum(randomStringWithChecksum: string): boolean {
    // Split the input string into the random part and the provided checksum
    const [randomPart, providedChecksum] = randomStringWithChecksum.split('_');

    // Generate the checksum for the random part using the same logic
    const recreatedChecksum = this.generateChecksum(randomPart);

    return recreatedChecksum === providedChecksum;
  }
}
