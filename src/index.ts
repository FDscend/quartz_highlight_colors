export { HighlightColors, remarkHighlightColors } from "./highlight-colors";
export { applyHighlightColors, buildHighlightCss, colorPalette } from "./colors";
export { transformHighlightSyntax } from "./highlight-syntax";

// Re-export shared types from @quartz-community/types
export type {
  BuildCtx,
  CSSResource,
  JSResource,
  QuartzPluginData,
  ProcessedContent,
  QuartzTransformerPlugin,
  QuartzTransformerPluginInstance,
  StaticResources,
} from "@quartz-community/types";
