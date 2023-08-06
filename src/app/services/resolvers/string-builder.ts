export class StringBuilder {
    private buffer: string[];
    
    constructor() {
        this.buffer = [];
    }
    
    public append(str: string): void {
        this.buffer.push(str);
    }
    
    public toString(): string {
        return this.buffer.join('');
    }
}
