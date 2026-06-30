class Chip8 {
    constructor() {
        this.memory = new Uint8Array(4096)
        this.V = new Uint8Array(16)
        this.PC = 0x200
        this.I = 0
        this.stack = new Uint16Array(16)
        this.SP = 0
        this.display = new Uint8Array(64 * 32)
        this.delayTimer = 0
        this.soundTimer = 0
        this.keys = new Uint8Array(16)

        this.loadFonts()
    }

    loadFonts() {
        const fonts = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ]
        fonts.forEach((byte, i) => this.memory[i] = byte) 
    }

    loadROM(data){

        for(let i = 0; i < data.length; i++){
            this.memory[0x200 + i] = data[i]
        }
    }

    cycle(){
        const opcode = (this.memory[this.PC] << 8) | this.memory[this.PC + 1]
        console.log('opcode:', opcode.toString(16), 'PC:', this.PC.toString(16))
        this.PC += 2

        this.execute(opcode)
    }
    execute(opcode){
        const x     = (opcode & 0x0F00) >> 8
        const y     = (opcode & 0x00F0) >> 4
        const n     = opcode & 0x000F
        const nn    = opcode & 0x00FF
        const nnn   = opcode & 0x0FFF
        
        switch (opcode & 0xF000) {
            case 0x000:
                if (opcode === 0x00E0) {
                    this.display.fill(0)
                }
                else if(opcode == 0x00EE){
                    SP--
                    this.PC = this.stack[this.SP]
                }
                break;
            
            case 0x1000:
                this.PC = nnn
                break
            
            case 0x6000:
                this.V[x] = nn
                break

            case 0x7000:
                this.V[x] = (this.V[x] + nn) & 0xFF
                break
            case 0xD000: {
                const xPos = this.V[x] % 64
                const yPos = this.V[y] % 32
                this.V[0xF] = 0
                console.log('DRAW at', xPos, yPos, 'n:', n, 'I:', this.I.toString(16))

                for(let row = 0; row < n; row++){
                    const spriteByte = this.memory[this.I + row]

                    for(let col = 0; col < 8; col++){
                        if(spriteByte & (0x80 >> col)){
                            const px = (xPos + col) % 64
                            const py = (yPos + row) % 32
                            const idx = py * 64 + px

                            if(this.display[idx] === 1){
                                this.v[0xF] = 1
                            }
                            this.display[idx] ^= 1
                        }
                    }
                }
                break
            }
            case 0xA000: {
                this.I = nnn
                break
            }
            case 0x2000: {
                this.stack[this.SP] = this.PC
                this.SP++
                this.PC = nnn
                break
            }
            case 0x3000: {
                if(this.V[x] === nn){
                        this.PC += 2
                    }
                break
            }
            case 0x4000: {
                if(this.V[x] !== nn){
                        this.PC += 2
                    }
                break
            }
            case 0x5000: {
                if(this.V[x] === this.V[y]){
                        this.PC += 2
                    }
                break
            }
            case 0x8000: {
                switch(opcode & 0x000F){
                    case 0x0: this.V[x] = this.V[y]
                    case 0x1: this.V[x] |= this.V[y]
                    case 0x2: this.V[x] &= this.V[y]
                    case 0x3: this.V[x] ^= this.V[y]
                    // continue from here
                    case 0x4: 
                    case 0x5: 
                    case 0x6: 
                    case 0x7: 
                    case 0xE: 
                }
                break
            }
        }
    }
}
