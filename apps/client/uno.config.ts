import presetTypography from '@unocss/preset-typography'
import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [presetWind3(), presetTypography()],
})
