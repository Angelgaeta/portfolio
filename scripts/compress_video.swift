import AVFoundation
import Foundation

func usageAndExit(_ message: String? = nil, code: Int32 = 2) -> Never {
  if let message {
    fputs("Error: \(message)\n", stderr)
  }
  fputs("Usage: compress_video.swift <input> <output> [preset]\n", stderr)
  fputs("  preset: 720p | 1080p | medium | low | highest | passthrough | hevc1080 | hevchighest\n", stderr)
  exit(code)
}

let args = CommandLine.arguments
guard args.count == 3 || args.count == 4 else { usageAndExit() }

let inputPath = args[1]
let outputPath = args[2]
let presetArg = (args.count == 4) ? args[3].lowercased() : nil

let inputURL = URL(fileURLWithPath: inputPath)
let outputURL = URL(fileURLWithPath: outputPath)

guard FileManager.default.fileExists(atPath: inputURL.path) else {
  usageAndExit("Input file not found: \(inputURL.path)")
}

// Remove any existing output file.
try? FileManager.default.removeItem(at: outputURL)

let asset = AVAsset(url: inputURL)
let compatiblePresets = AVAssetExportSession.exportPresets(compatibleWith: asset)

let presetByArg: [String: String] = [
  "720p": AVAssetExportPreset1280x720,
  "1080p": AVAssetExportPreset1920x1080,
  "medium": AVAssetExportPresetMediumQuality,
  "low": AVAssetExportPresetLowQuality,
  "highest": AVAssetExportPresetHighestQuality,
  "hevc1080": AVAssetExportPresetHEVC1920x1080,
  "hevchighest": AVAssetExportPresetHEVCHighestQuality,
  "passthrough": AVAssetExportPresetPassthrough
]

let preferredPresets = [
  // Small-ish background video defaults (avoid "highest quality" presets).
  AVAssetExportPreset1280x720,
  AVAssetExportPreset1920x1080,
  AVAssetExportPresetMediumQuality,
  AVAssetExportPresetLowQuality,
  AVAssetExportPresetPassthrough
]

let requestedPreset = presetArg.flatMap { presetByArg[$0] }
if let requestedPreset, !compatiblePresets.contains(requestedPreset) {
  usageAndExit("Requested preset not compatible: \(requestedPreset)", code: 1)
}

guard let preset = requestedPreset ?? preferredPresets.first(where: { compatiblePresets.contains($0) }) else {
  usageAndExit("No compatible export presets for this asset", code: 1)
}

fputs("Chosen preset: \(preset)\n", stderr)
guard let exporter = AVAssetExportSession(asset: asset, presetName: preset) else {
  usageAndExit("Could not create export session (preset: \(preset))", code: 1)
}

exporter.outputURL = outputURL
exporter.shouldOptimizeForNetworkUse = true

// Pick the best container supported by this exporter.
let preferredTypes: [AVFileType] = [.mp4, .mov, .m4v]
fputs("Supported output types: \(exporter.supportedFileTypes.map { $0.rawValue })\n", stderr)
if let fileType = preferredTypes.first(where: { exporter.supportedFileTypes.contains($0) }) {
  exporter.outputFileType = fileType
} else if let fileType = exporter.supportedFileTypes.first {
  exporter.outputFileType = fileType
} else {
  usageAndExit("No supported output file types for exporter", code: 1)
}

// Align the output filename extension with the chosen file type to avoid opaque AVFoundation errors.
let extByType: [AVFileType: String] = [.mp4: "mp4", .mov: "mov", .m4v: "m4v"]
if let wantedExt = extByType[exporter.outputFileType ?? .mov] {
  if outputURL.pathExtension.lowercased() != wantedExt {
    let fixedURL = outputURL.deletingPathExtension().appendingPathExtension(wantedExt)
    try? FileManager.default.removeItem(at: fixedURL)
    exporter.outputURL = fixedURL
  }
}

let sema = DispatchSemaphore(value: 0)
exporter.exportAsynchronously {
  sema.signal()
}
sema.wait()

switch exporter.status {
case .completed:
  print("OK: \(outputURL.path)")
case .failed:
  if let err = exporter.error as NSError? {
    fputs("Export failed.\n", stderr)
    fputs("  domain: \(err.domain)\n", stderr)
    fputs("  code: \(err.code)\n", stderr)
    fputs("  message: \(err.localizedDescription)\n", stderr)
    fputs("  userInfo: \(err.userInfo)\n", stderr)
  }
  let message = exporter.error?.localizedDescription ?? "Unknown error"
  usageAndExit("Export failed: \(message)", code: 1)
case .cancelled:
  usageAndExit("Export cancelled", code: 1)
default:
  let message = exporter.error?.localizedDescription ?? "Status: \(exporter.status.rawValue)"
  usageAndExit("Export did not complete: \(message)", code: 1)
}
