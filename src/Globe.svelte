<script lang="ts">
  // import { init as initWorld } from './map'
  import { data, projection } from './globe/map'
  import initRender from './globe/render'
  import initInteract from './globe/interaction'

  let canvas: HTMLCanvasElement

  $: if (canvas) {
    start()
  }

  async function start() {
    let running = false
    let dragMoment = false
    let lastDragDir

    const { render, initialScale, pathGenerator, onHover } = initRender(
      canvas,
      data,
      projection
    )

    function handleDragEvent(event, payload) {
      switch (event) {
        case 'start':
          dragMoment = false
          break
        case 'stop':
          dragMoment = true
          break
        case 'dir':
          lastDragDir = payload
          break
      }
    }

    const { onUpdate } = initInteract(
      startStep,
      handleDragEvent,
      projection,
      initialScale,
      pathGenerator,
      onHover
    )

    function update() {
      if (!dragMoment || !lastDragDir) return false

      const nextDragDir = lastDragDir.map(v => v * 0.95)
      const mag = Math.sqrt(nextDragDir.reduce((a, c) => a ** 2 + c, 0))
      if (mag < 0.1) return false
      const rotate = projection.rotate()
      const k = 90 / projection.scale()
      const next: Point = [
        rotate[0] + nextDragDir[0] * k,
        rotate[1] - nextDragDir[1] * k,
      ]
      next[1] = Math.max(Math.min(next[1], 60), -60)
      projection.rotate(next)
      lastDragDir = nextDragDir
      onUpdate()
      return true
    }

    let lastRequest = 0

    function startStep() {
      lastRequest = performance.now()
      if (running) return
      running = true

      const step = () => {
        const next = update() || performance.now() - lastRequest < 200
        render()
        if (next) requestAnimationFrame(step)
        else {
          running = false
        }
      }
      step()
    }
    startStep()
  }
</script>

<style>
  canvas {
    width: 100vw;
    height: 100vh;
    position: absolute;
    left: 0;
    top: 0;
  }
</style>

<canvas bind:this={canvas} />
