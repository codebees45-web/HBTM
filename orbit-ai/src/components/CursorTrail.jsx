import { useEffect, useRef } from 'react'

export default function CursorTrail() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent = canvas.parentElement
    let animId
    let points = []

    function resize() {
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()
    window.addEventListener('resize', resize)

    // HSL hue cycles continuously for rainbow effect
    let hue = 0

    function onMouseMove(e) {
      const rect = parent.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      // Only add points if inside the panel
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        hue = (hue + 2) % 360
        points.push({ x, y, hue, alpha: 1, size: 3 })
      }
    }

    parent.addEventListener('mousemove', onMouseMove)

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connecting lines between recent points
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1]
        const p1 = points[i]
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.strokeStyle = `hsla(${p1.hue}, 90%, 65%, ${p1.alpha * 0.6})`
        ctx.lineWidth = p1.size * p1.alpha
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // Draw glowing dots at each point
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`
        ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${p.alpha * 0.8})`
        ctx.shadowBlur = 12 * p.alpha
        ctx.fill()
        ctx.shadowBlur = 0

        // Fade out
        p.alpha -= 0.012
      }

      // Remove fully faded points
      points = points.filter(p => p.alpha > 0.01)

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      parent.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2
      }}
    />
  )
}
