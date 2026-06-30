const canvas = document.getElementById('screen')
const ctx = canvas.getContext('2d')
const cpu = new Chip8()
function drawDisplay() {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 640, 320)
    ctx.fillStyle = '#0f0'
    for(let y = 0; y < 32; y++){
        for(let x = 0; x < 64; x++){
            if(cpu.display[y * 64 + x]){
                ctx.fillRect(x * 10, y * 10, 10, 10)
            }
        }
    }
}
function loop(){
    for(let i = 0; i < 10; i++){
        cpu.cycle()
    }
    drawDisplay()
    requestAnimationFrame(loop)
}
document.getElementById('romLoader').addEventListener('change' , (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (ev) => {
        console.log('ROM loaded, bytes:', ev.target.result.byteLength)
        const rom = new Uint8Array(ev.target.result)
        cpu.loadROM(rom)
        loop()
    }
    reader.readAsArrayBuffer(file)
})
