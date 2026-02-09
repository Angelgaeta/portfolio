import AVFoundation
import Foundation

func usageAndExit(_ message: String? = nil) -> Never {
  if let message { fputs("Error: \(message)\n", stderr) }
  fputs("Usage: video_info.swift <video_path>\n", stderr)
  exit(2)
}

let args = CommandLine.arguments
guard args.count == 2 else { usageAndExit() }

let url = URL(fileURLWithPath: args[1])
guard FileManager.default.fileExists(atPath: url.path) else { usageAndExit("File not found: \(url.path)") }

let asset = AVURLAsset(url: url)
let duration = asset.duration
let seconds = duration.isNumeric ? CMTimeGetSeconds(duration) : -1

let videoTracks = asset.tracks(withMediaType: .video)
let audioTracks = asset.tracks(withMediaType: .audio)

print("path: \(url.path)")
if seconds >= 0 {
  print(String(format: "duration: %.2fs", seconds))
} else {
  print("duration: unknown")
}
print("video tracks: \(videoTracks.count)")
print("audio tracks: \(audioTracks.count)")

if let t = videoTracks.first {
  let size = t.naturalSize.applying(t.preferredTransform)
  let w = abs(size.width)
  let h = abs(size.height)
  print(String(format: "resolution: %.0fx%.0f", w, h))
  print(String(format: "nominalFrameRate: %.2f", t.nominalFrameRate))
  print(String(format: "estimatedDataRate: %.0f kbps", t.estimatedDataRate / 1000.0))
}

