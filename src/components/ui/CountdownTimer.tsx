import { useEffect, useState } from "react"

export default function CountdownTimer({ hours }: { hours: number }) {
  const [timeLeft, setTimeLeft] = useState(hours * 3600)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const h = Math.floor(timeLeft / 3600)
  const m = Math.floor((timeLeft % 3600) / 60)
  const s = timeLeft % 60

  return (
    <div style={{ color: "#fff", margin: "20px 0" }}>
      Sale Ends In: {h}h {m}m {s}s
    </div>
  )
}