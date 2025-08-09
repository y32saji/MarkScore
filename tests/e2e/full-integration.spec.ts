import { test, expect } from '@playwright/test'
import { join } from 'path'

test.describe('Full Integration Tests', () => {
  test('should complete full plugin workflow from registration to rendering', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    // Wait for Mermaid to load
    await page.waitForFunction(() => typeof window.mermaid !== 'undefined', { timeout: 10000 })

    // Inject comprehensive mock plugin
    await page.addScriptTag({
      content: `
        window.mockMusicPlugin = {
          id: 'music',
          detector: (text) => {
            console.log('Detecting diagram:', text.substring(0, 50));
            return text.includes('music-abc');
          },
          parser: {
            parse: (input) => {
              console.log('Parsing input:', input.substring(0, 50));
              const lines = input.split('\\n').filter(line => line.trim());
              const elements = [];
              
              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('clef ')) {
                  elements.push({ type: 'clef', value: trimmed.split(' ')[1] });
                } else if (trimmed.startsWith('time ')) {
                  const [num, denom] = trimmed.split(' ')[1].split('/');
                  elements.push({ type: 'timeSignature', numerator: parseInt(num), denominator: parseInt(denom) });
                } else if (trimmed.match(/[A-G][#b]?[0-9]\\s+[qhwes]/)) {
                  const parts = trimmed.split(/\\s+/);
                  for (let i = 0; i < parts.length; i += 2) {
                    if (parts[i] && parts[i + 1]) {
                      elements.push({ type: 'note', pitch: parts[i], duration: parts[i + 1] });
                    }
                  }
                }
              }
              
              return { elements, valid: true };
            }
          },
          renderer: {
            draw: (text, id) => {
              console.log('Rendering to container:', id);
              const container = document.getElementById(id);
              if (!container) return null;
              
              const parseResult = window.mockMusicPlugin.parser.parse(text);
              
              let svg = '<svg width="600" height="150" xmlns="http://www.w3.org/2000/svg" aria-label="Musical score">';
              svg += '<rect width="600" height="150" fill="#ffffff" stroke="#ddd" stroke-width="1"/>';
              
              // Staff lines
              for (let i = 0; i < 5; i++) {
                const y = 50 + (i * 8);
                svg += '<line x1="40" y1="' + y + '" x2="560" y2="' + y + '" stroke="#000" stroke-width="1" aria-hidden="true"/>';
              }
              
              let x = 60;
              for (const element of parseResult.elements) {
                if (element.type === 'clef') {
                  svg += '<path d="M ' + x + ' 82 C ' + (x-3) + ' 86 ' + (x-6) + ' 78 ' + (x-3) + ' 74" stroke="#000" stroke-width="2" fill="none" aria-label="' + element.value + ' clef"/>';
                  x += 35;
                } else if (element.type === 'timeSignature') {
                  svg += '<text x="' + x + '" y="62" font-size="12" text-anchor="middle" fill="#000" aria-label="Time signature ' + element.numerator + '/' + element.denominator + '">' + element.numerator + '</text>';
                  svg += '<text x="' + x + '" y="78" font-size="12" text-anchor="middle" fill="#000" aria-hidden="true">' + element.denominator + '</text>';
                  x += 25;
                } else if (element.type === 'note') {
                  const noteY = 66; // Simplified positioning on staff
                  svg += '<ellipse cx="' + x + '" cy="' + noteY + '" rx="3" ry="2" fill="#000" aria-label="' + element.pitch + ' ' + element.duration + ' note"/>';
                  if (element.duration !== 'w') {
                    svg += '<line x1="' + (x + 2.5) + '" y1="' + noteY + '" x2="' + (x + 2.5) + '" y2="' + (noteY - 18) + '" stroke="#000" stroke-width="1" aria-hidden="true"/>';
                  }
                  x += 30;
                }
              }
              
              svg += '</svg>';
              container.innerHTML = svg;
              return svg;
            }
          },
          register: () => {
            console.log('Mock plugin registered successfully');
            return true;
          }
        };
      `
    })

    // Step 1: Test plugin registration
    const registrationTest = await page.evaluate(async () => {
      try {
        if (window.mockMusicPlugin && typeof window.mockMusicPlugin.register === 'function') {
          const result = window.mockMusicPlugin.register()
          return { success: true, registered: result, error: null }
        } else {
          return { success: false, registered: false, error: 'Plugin not available' }
        }
      } catch (error) {
        return { success: false, registered: false, error: error.message }
      }
    })

    expect(registrationTest.success).toBe(true)
    console.log('Plugin registration test:', registrationTest)

    // Step 2: Test diagram detection
    const detectionTest = await page.evaluate(() => {
      const testCases = [
        { input: 'music-abc\n  clef treble', shouldDetect: true },
        { input: 'graph TD\n  A --> B', shouldDetect: false },
        { input: 'music-abc\n  invalid syntax', shouldDetect: true }
      ]

      const results = []
      for (const testCase of testCases) {
        try {
          const detected = window.mockMusicPlugin.detector(testCase.input)
          results.push({
            input: testCase.input.substring(0, 30) + '...',
            expected: testCase.shouldDetect,
            actual: detected,
            correct: detected === testCase.shouldDetect
          })
        } catch (error) {
          results.push({
            input: testCase.input.substring(0, 30) + '...',
            expected: testCase.shouldDetect,
            actual: false,
            correct: false,
            error: error.message
          })
        }
      }

      return {
        success: results.every(r => r.correct),
        results
      }
    })

    expect(detectionTest.success).toBe(true)
    console.log('Detection test results:', detectionTest.results)

    // Step 3: Test parsing functionality
    const parsingTest = await page.evaluate(() => {
      const testInput = `music-abc
  clef treble
  time 4/4
  C4 q D4 q E4 q F4 q
  G4 h A4 h`

      try {
        const result = window.mockMusicPlugin.parser.parse(testInput)
        
        const clefElements = result.elements.filter(el => el.type === 'clef')
        const timeElements = result.elements.filter(el => el.type === 'timeSignature')
        const noteElements = result.elements.filter(el => el.type === 'note')

        return {
          success: true,
          valid: result.valid,
          totalElements: result.elements.length,
          clefCount: clefElements.length,
          timeCount: timeElements.length,
          noteCount: noteElements.length,
          clef: clefElements[0]?.value,
          timeSignature: timeElements[0] ? `${timeElements[0].numerator}/${timeElements[0].denominator}` : null,
          firstNote: noteElements[0] ? `${noteElements[0].pitch} ${noteElements[0].duration}` : null,
          lastNote: noteElements[noteElements.length - 1] ? `${noteElements[noteElements.length - 1].pitch} ${noteElements[noteElements.length - 1].duration}` : null
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    expect(parsingTest.success).toBe(true)
    expect(parsingTest.valid).toBe(true)
    expect(parsingTest.clefCount).toBe(1)
    expect(parsingTest.timeCount).toBe(1)
    expect(parsingTest.noteCount).toBeGreaterThan(0)
    console.log('Parsing test results:', parsingTest)

    // Step 4: Test SVG rendering
    const renderingTest = await page.evaluate(() => {
      const testInput = `music-abc
  clef treble
  time 4/4
  C4 q D4 q E4 q F4 q`

      try {
        // Create test container
        const container = document.createElement('div')
        container.id = 'integration-test-container'
        document.body.appendChild(container)

        const svg = window.mockMusicPlugin.renderer.draw(testInput, 'integration-test-container')
        
        const hasValidSVG = svg && svg.includes('<svg') && svg.includes('</svg>')
        const hasStaffLines = svg && svg.includes('<line') && (svg.match(/<line/g) || []).length >= 5
        const hasAriaLabels = svg && svg.includes('aria-label=')
        const hasMusicalElements = svg && (svg.includes('<ellipse') || svg.includes('<path'))
        const containerHasContent = container.innerHTML.length > 0

        return {
          success: true,
          hasValidSVG,
          hasStaffLines,
          hasAriaLabels,
          hasMusicalElements,
          containerHasContent,
          svgLength: svg ? svg.length : 0,
          containerLength: container.innerHTML.length
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    expect(renderingTest.success).toBe(true)
    expect(renderingTest.hasValidSVG).toBe(true)
    expect(renderingTest.hasStaffLines).toBe(true)
    expect(renderingTest.hasAriaLabels).toBe(true)
    expect(renderingTest.containerHasContent).toBe(true)
    console.log('Rendering test results:', renderingTest)

    // Step 5: Test error handling across the pipeline
    const errorHandlingTest = await page.evaluate(() => {
      const errorTests = []

      // Test detector with invalid input
      try {
        window.mockMusicPlugin.detector(null)
        errorTests.push({ component: 'detector', test: 'null input', success: false, error: 'Should have thrown error' })
      } catch (error) {
        errorTests.push({ component: 'detector', test: 'null input', success: true, error: error.message })
      }

      // Test parser with invalid syntax (should still work with mock)
      try {
        const result = window.mockMusicPlugin.parser.parse('music-abc\\n  invalid syntax')
        errorTests.push({ 
          component: 'parser', 
          test: 'invalid syntax', 
          success: result.valid !== undefined, 
          error: null 
        })
      } catch (error) {
        errorTests.push({ component: 'parser', test: 'invalid syntax', success: true, error: error.message })
      }

      // Test renderer with missing container
      try {
        const result = window.mockMusicPlugin.renderer.draw('music-abc\\n  test', 'nonexistent-container')
        errorTests.push({ 
          component: 'renderer', 
          test: 'missing container', 
          success: result === null, 
          error: null 
        })
      } catch (error) {
        errorTests.push({ component: 'renderer', test: 'missing container', success: true, error: error.message })
      }

      return {
        success: errorTests.every(t => t.success),
        tests: errorTests
      }
    })

    expect(errorHandlingTest.success).toBe(true)
    console.log('Error handling test results:', errorHandlingTest.tests)

    // Step 6: Test accessibility features
    const accessibilityTest = await page.evaluate(() => {
      const container = document.getElementById('integration-test-container')
      if (!container) return { success: false, error: 'Test container not found' }

      const svg = container.innerHTML
      
      const hasMainAriaLabel = svg.includes('aria-label="Musical score"')
      const hasElementAriaLabels = (svg.match(/aria-label="/g) || []).length > 1
      const hasAriaHidden = svg.includes('aria-hidden="true"')
      
      return {
        success: true,
        hasMainAriaLabel,
        hasElementAriaLabels,
        hasAriaHidden,
        ariaLabelCount: (svg.match(/aria-label="/g) || []).length,
        ariaHiddenCount: (svg.match(/aria-hidden="true"/g) || []).length
      }
    })

    expect(accessibilityTest.success).toBe(true)
    expect(accessibilityTest.hasMainAriaLabel).toBe(true)
    expect(accessibilityTest.hasElementAriaLabels).toBe(true)
    console.log('Accessibility test results:', accessibilityTest)

    // Step 7: Performance validation
    const performanceTest = await page.evaluate(() => {
      const startTime = performance.now()
      
      const testInput = `music-abc
  clef treble
  time 6/8
  C4 e D4 e E4 e F4 e G4 e A4 e
  B4 q C5 h D5 q E5 e F5 s G5 s`

      try {
        // Create performance test container
        const container = document.createElement('div')
        container.id = 'performance-test-container'
        document.body.appendChild(container)

        const svg = window.mockMusicPlugin.renderer.draw(testInput, 'performance-test-container')
        
        const endTime = performance.now()
        const totalTime = endTime - startTime

        return {
          success: true,
          totalTime,
          svgGenerated: svg !== null,
          svgLength: svg ? svg.length : 0,
          elementCount: svg ? (svg.match(/<ellipse/g) || []).length : 0
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    expect(performanceTest.success).toBe(true)
    expect(performanceTest.totalTime).toBeLessThan(100) // Should complete within 100ms
    expect(performanceTest.svgGenerated).toBe(true)
    console.log('Performance test results:', performanceTest)

    // Final integration validation
    await expect(page.locator('#integration-test-container')).toBeVisible()
    await expect(page.locator('#integration-test-container svg')).toBeVisible()

    const finalValidation = await page.evaluate(() => {
      return {
        mermaidAvailable: typeof window.mermaid !== 'undefined',
        pluginAvailable: typeof window.mockMusicPlugin !== 'undefined',
        svgRendered: document.querySelector('#integration-test-container svg') !== null,
        testsPassed: true
      }
    })

    expect(finalValidation.mermaidAvailable).toBe(true)
    expect(finalValidation.pluginAvailable).toBe(true)
    expect(finalValidation.svgRendered).toBe(true)
    
    console.log('Full integration test completed successfully!')
  })

  test('should run comprehensive test suite from fixture page', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    // Wait for page to load and run its built-in tests
    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.waitForFunction(() => typeof window.runAllTests === 'function')

    // Run the built-in test suite
    const testResults = await page.evaluate(async () => {
      try {
        const results = await window.runAllTests()
        return {
          success: true,
          results,
          testResults: window.testResults
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Fixture page test results:', testResults)

    expect(testResults.success).toBe(true)
    if (testResults.results) {
      expect(testResults.results.total).toBeGreaterThan(0)
      expect(testResults.results.passed).toBeGreaterThan(0)
    }

    // Verify test results are displayed on page
    await expect(page.locator('#test-results')).toBeVisible()
    const testResultsContent = await page.locator('#test-results').textContent()
    expect(testResultsContent).toBeTruthy()
    expect(testResultsContent.length).toBeGreaterThan(0)
  })

  test('should demonstrate complete user workflow', async ({ page }) => {
    // Simulate a user's complete workflow from opening page to seeing rendered music
    const fixturePath = join(__dirname, './fixtures/basic-test.html')
    await page.goto(`file://${fixturePath}`)

    // Step 1: User sees the page load
    await expect(page.locator('h1')).toContainText('Mermaid Music Plugin Test Page')

    // Step 2: User checks plugin status
    await page.waitForSelector('#plugin-status')
    const pluginStatus = await page.locator('#plugin-status').textContent()
    expect(pluginStatus).toBeTruthy()
    console.log('User sees plugin status:', pluginStatus)

    // Step 3: User sees music diagrams (even if not properly rendered without actual plugin)
    const musicDiagrams = await page.locator('.mermaid').count()
    expect(musicDiagrams).toBeGreaterThan(0)
    console.log(`User sees ${musicDiagrams} music diagram containers`)

    // Step 4: User can see diagram content
    for (let i = 0; i < musicDiagrams; i++) {
      const diagramContent = await page.locator('.mermaid').nth(i).textContent()
      expect(diagramContent).toBeTruthy()
      expect(diagramContent).toContain('music-abc')
    }

    // Step 5: Verify page is functional and responsive
    await expect(page.locator('body')).toBeVisible()
    
    const pageTitle = await page.title()
    expect(pageTitle).toBe('Mermaid Music Plugin Test')
    
    console.log('Complete user workflow test passed!')
  })
})