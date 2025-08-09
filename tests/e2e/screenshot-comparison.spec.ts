import { test, expect } from '@playwright/test'
import { join } from 'path'

test.describe('Screenshot Comparison Tests', () => {
  const pluginCode = `
    // Mock plugin for visual testing
    window.mockMusicPlugin = {
      id: 'music',
      detector: (text) => text.includes('music-abc'),
      renderer: {
        draw: (text, id) => {
          const container = document.getElementById(id);
          if (!container) return null;
          
          // Create consistent visual output for screenshot testing
          const svg = '<svg width="600" height="150" xmlns="http://www.w3.org/2000/svg" style="background: white; font-family: Arial, sans-serif;">' +
            '<rect width="600" height="150" fill="#ffffff" stroke="#000" stroke-width="1"/>' +
            '<g aria-label="Staff lines">' +
            '<line x1="50" y1="50" x2="550" y2="50" stroke="#000" stroke-width="1"/>' +
            '<line x1="50" y1="60" x2="550" y2="60" stroke="#000" stroke-width="1"/>' +
            '<line x1="50" y1="70" x2="550" y2="70" stroke="#000" stroke-width="1"/>' +
            '<line x1="50" y1="80" x2="550" y2="80" stroke="#000" stroke-width="1"/>' +
            '<line x1="50" y1="90" x2="550" y2="90" stroke="#000" stroke-width="1"/>' +
            '</g>';
            
          // Parse simple elements for consistent rendering
          if (text.includes('clef treble')) {
            svg += '<path d="M 70 90 C 66 94 62 86 66 82 C 70 78 74 82 70 86" stroke="#000" stroke-width="2" fill="none" aria-label="treble clef"/>';
          }
          
          if (text.includes('time 4/4')) {
            svg += '<text x="110" y="65" font-size="14" text-anchor="middle" fill="#000">4</text>';
            svg += '<text x="110" y="85" font-size="14" text-anchor="middle" fill="#000">4</text>';
          }
          
          let noteX = 150;
          const notes = text.match(/[A-G][#b]?[0-9]\\s+[qhwes]/g) || [];
          for (const note of notes) {
            const [pitch, duration] = note.split(/\\s+/);
            svg += '<ellipse cx="' + noteX + '" cy="70" rx="3" ry="2" fill="#000"/>';
            if (duration !== 'w') {
              svg += '<line x1="' + (noteX + 2) + '" y1="70" x2="' + (noteX + 2) + '" y2="50" stroke="#000" stroke-width="1"/>';
            }
            noteX += 40;
          }
          
          svg += '</svg>';
          
          container.innerHTML = svg;
          return svg;
        }
      }
    };
  `

  test.beforeEach(async ({ page }) => {
    // Set up consistent viewport for screenshots
    await page.setViewportSize({ width: 1200, height: 800 })
  })

  test('should render basic music notation consistently', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Screenshot Test - Basic</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #f5f5f5; 
          }
          .container { 
            background: white; 
            padding: 20px; 
            border-radius: 8px;
            margin: 10px 0;
          }
          h2 { margin: 0 0 10px 0; color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Basic Music Notation</h2>
          <div id="basic-music"></div>
        </div>
      </body>
      </html>
    `)

    await page.addScriptTag({ content: pluginCode })

    // Render the diagram
    await page.evaluate(() => {
      if (window.mockMusicPlugin) {
        window.mockMusicPlugin.renderer.draw(`music-abc
  clef treble
  time 4/4
  C4 q D4 q E4 q F4 q`, 'basic-music')
      }
    })

    // Wait for rendering to complete
    await page.waitForTimeout(100)

    // Take screenshot
    await expect(page).toHaveScreenshot('basic-music-notation.png')
  })

  test('should render notes with accidentals consistently', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Screenshot Test - Accidentals</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #f5f5f5; 
          }
          .container { 
            background: white; 
            padding: 20px; 
            border-radius: 8px;
          }
          h2 { margin: 0 0 10px 0; color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Notes with Accidentals</h2>
          <div id="accidentals-music"></div>
        </div>
      </body>
      </html>
    `)

    await page.addScriptTag({ content: pluginCode })

    await page.evaluate(() => {
      if (window.mockMusicPlugin) {
        window.mockMusicPlugin.renderer.draw(`music-abc
  clef treble
  time 4/4
  F#4 q Bb4 q C#5 q Ab3 q`, 'accidentals-music')
      }
    })

    await page.waitForTimeout(100)
    await expect(page).toHaveScreenshot('accidentals-music-notation.png')
  })

  test('should render different note durations consistently', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Screenshot Test - Durations</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #f5f5f5; 
          }
          .container { 
            background: white; 
            padding: 20px; 
            border-radius: 8px;
          }
          h2 { margin: 0 0 10px 0; color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Different Note Durations</h2>
          <div id="durations-music"></div>
        </div>
      </body>
      </html>
    `)

    await page.addScriptTag({ content: pluginCode })

    await page.evaluate(() => {
      if (window.mockMusicPlugin) {
        window.mockMusicPlugin.renderer.draw(`music-abc
  clef treble
  time 4/4
  C4 w D4 h E4 q F4 e G4 s`, 'durations-music')
      }
    })

    await page.waitForTimeout(100)
    await expect(page).toHaveScreenshot('durations-music-notation.png')
  })

  test('should render bass clef consistently', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Screenshot Test - Bass Clef</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #f5f5f5; 
          }
          .container { 
            background: white; 
            padding: 20px; 
            border-radius: 8px;
          }
          h2 { margin: 0 0 10px 0; color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Bass Clef Notation</h2>
          <div id="bass-music"></div>
        </div>
      </body>
      </html>
    `)

    const bassPluginCode = pluginCode.replace('clef treble', 'clef bass').replace('treble clef', 'bass clef')
    await page.addScriptTag({ content: bassPluginCode })

    await page.evaluate(() => {
      if (window.mockMusicPlugin) {
        window.mockMusicPlugin.renderer.draw(`music-abc
  clef bass
  time 3/4
  C3 q D3 q E3 h`, 'bass-music')
      }
    })

    await page.waitForTimeout(100)
    await expect(page).toHaveScreenshot('bass-clef-music-notation.png')
  })

  test('should render complex score consistently', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Screenshot Test - Complex Score</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #f5f5f5; 
          }
          .container { 
            background: white; 
            padding: 20px; 
            border-radius: 8px;
          }
          h2 { margin: 0 0 10px 0; color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Complex Musical Score</h2>
          <div id="complex-music" style="width: 800px; overflow-x: auto;"></div>
        </div>
      </body>
      </html>
    `)

    // Extended plugin for complex rendering
    const complexPluginCode = `
      window.mockMusicPlugin = {
        id: 'music',
        renderer: {
          draw: (text, id) => {
            const container = document.getElementById(id);
            if (!container) return null;
            
            const svg = '<svg width="750" height="150" xmlns="http://www.w3.org/2000/svg" style="background: white; font-family: Arial, sans-serif;">' +
              '<rect width="750" height="150" fill="#ffffff" stroke="#000" stroke-width="1"/>' +
              '<g>' +
              '<line x1="50" y1="50" x2="700" y2="50" stroke="#000" stroke-width="1"/>' +
              '<line x1="50" y1="60" x2="700" y2="60" stroke="#000" stroke-width="1"/>' +
              '<line x1="50" y1="70" x2="700" y2="70" stroke="#000" stroke-width="1"/>' +
              '<line x1="50" y1="80" x2="700" y2="80" stroke="#000" stroke-width="1"/>' +
              '<line x1="50" y1="90" x2="700" y2="90" stroke="#000" stroke-width="1"/>' +
              '</g>' +
              '<path d="M 70 90 C 66 94 62 86 66 82" stroke="#000" stroke-width="2" fill="none"/>' +
              '<text x="110" y="65" font-size="12" text-anchor="middle" fill="#000">6</text>' +
              '<text x="110" y="85" font-size="12" text-anchor="middle" fill="#000">8</text>' +
              '<ellipse cx="150" cy="70" rx="3" ry="2" fill="#000"/>' +
              '<line x1="152" y1="70" x2="152" y2="50" stroke="#000" stroke-width="1"/>' +
              '<ellipse cx="180" cy="65" rx="3" ry="2" fill="#000"/>' +
              '<line x1="182" y1="65" x2="182" y2="45" stroke="#000" stroke-width="1"/>' +
              '<ellipse cx="210" cy="60" rx="3" ry="2" fill="#000"/>' +
              '<line x1="212" y1="60" x2="212" y2="40" stroke="#000" stroke-width="1"/>' +
              '<ellipse cx="240" cy="75" rx="3" ry="2" fill="#000"/>' +
              '<line x1="242" y1="75" x2="242" y2="55" stroke="#000" stroke-width="1"/>' +
              '<ellipse cx="290" cy="80" rx="4" ry="3" fill="none" stroke="#000" stroke-width="1"/>' +
              '<line x1="294" y1="80" x2="294" y2="60" stroke="#000" stroke-width="1"/>' +
              '<ellipse cx="350" cy="85" rx="5" ry="4" fill="none" stroke="#000" stroke-width="2"/>' +
              '</svg>';
            
            container.innerHTML = svg;
            return svg;
          }
        }
      };
    `

    await page.addScriptTag({ content: complexPluginCode })

    await page.evaluate(() => {
      if (window.mockMusicPlugin) {
        window.mockMusicPlugin.renderer.draw(`music-abc
  clef treble
  time 6/8
  C4 e D4 e E4 e F4 e G4 h A4 w`, 'complex-music')
      }
    })

    await page.waitForTimeout(100)
    await expect(page).toHaveScreenshot('complex-music-notation.png')
  })

  test('should handle empty/error states consistently', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Screenshot Test - Error State</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #f5f5f5; 
          }
          .container { 
            background: white; 
            padding: 20px; 
            border-radius: 8px;
            border: 2px dashed #ccc;
          }
          h2 { margin: 0 0 10px 0; color: #666; }
          .error-message { 
            color: #d32f2f; 
            font-style: italic; 
            text-align: center;
            padding: 40px 20px;
            background: #ffebee;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Error/Empty State</h2>
          <div id="error-music">
            <div class="error-message">
              Music notation could not be rendered<br>
              <small>Plugin not available or invalid syntax</small>
            </div>
          </div>
        </div>
      </body>
      </html>
    `)

    await page.waitForTimeout(100)
    await expect(page).toHaveScreenshot('error-state-music-notation.png')
  })

  test('should render multiple diagrams consistently', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Screenshot Test - Multiple Diagrams</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #f5f5f5; 
          }
          .container { 
            background: white; 
            padding: 15px; 
            border-radius: 8px;
            margin: 10px 0;
          }
          h3 { margin: 0 0 8px 0; color: #333; font-size: 14px; }
          .diagrams-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
        </style>
      </head>
      <body>
        <h2 style="text-align: center; color: #333; margin-bottom: 20px;">Multiple Music Diagrams</h2>
        <div class="diagrams-grid">
          <div class="container">
            <h3>Simple Melody</h3>
            <div id="diagram-1"></div>
          </div>
          <div class="container">
            <h3>With Accidentals</h3>
            <div id="diagram-2"></div>
          </div>
          <div class="container">
            <h3>Bass Clef</h3>
            <div id="diagram-3"></div>
          </div>
          <div class="container">
            <h3>Mixed Durations</h3>
            <div id="diagram-4"></div>
          </div>
        </div>
      </body>
      </html>
    `)

    await page.addScriptTag({ content: pluginCode })

    await page.evaluate(() => {
      if (window.mockMusicPlugin) {
        window.mockMusicPlugin.renderer.draw('music-abc\n  clef treble\n  C4 q D4 q E4 q', 'diagram-1')
        window.mockMusicPlugin.renderer.draw('music-abc\n  clef treble\n  F#4 q Bb4 q', 'diagram-2')
        window.mockMusicPlugin.renderer.draw('music-abc\n  clef bass\n  C3 h D3 q', 'diagram-3')
        window.mockMusicPlugin.renderer.draw('music-abc\n  clef treble\n  C4 w D4 h E4 q', 'diagram-4')
      }
    })

    await page.waitForTimeout(200)
    await expect(page).toHaveScreenshot('multiple-music-diagrams.png')
  })
})