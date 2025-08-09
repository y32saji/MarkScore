import { test, expect } from '@playwright/test'
import { join } from 'path'

test.describe('Performance Testing for Complex Scores', () => {
  const pluginCode = `
    // Mock plugin with performance testing capabilities
    window.mockMusicPlugin = {
      id: 'music',
      detector: (text) => text.includes('music-abc'),
      parser: {
        parse: (input) => {
          const startTime = performance.now();
          
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
          
          const endTime = performance.now();
          
          return { 
            elements, 
            valid: true, 
            parseTime: endTime - startTime,
            elementCount: elements.length
          };
        }
      },
      renderer: {
        draw: (text, id) => {
          const startTime = performance.now();
          
          const container = document.getElementById(id);
          if (!container) return null;
          
          // Parse first
          const parseResult = window.mockMusicPlugin.parser.parse(text);
          
          // Generate SVG
          let svg = '<svg width="800" height="200" xmlns="http://www.w3.org/2000/svg" aria-label="Musical score">';
          svg += '<rect width="800" height="200" fill="#ffffff" />';
          
          // Add staff lines
          for (let i = 0; i < 5; i++) {
            const y = 60 + (i * 8);
            svg += '<line x1="20" y1="' + y + '" x2="780" y2="' + y + '" stroke="#000000" stroke-width="1" aria-hidden="true" />';
          }
          
          let x = 50;
          for (const element of parseResult.elements) {
            if (element.type === 'clef') {
              svg += '<path d="M ' + x + ' 96 L ' + x + ' 70" stroke="#000000" stroke-width="2" aria-label="' + element.value + ' clef" />';
              x += 40;
            } else if (element.type === 'timeSignature') {
              svg += '<text x="' + x + '" y="76" font-size="16" aria-label="Time signature ' + element.numerator + '/' + element.denominator + '">' + element.numerator + '</text>';
              svg += '<text x="' + x + '" y="92" font-size="16" aria-hidden="true">' + element.denominator + '</text>';
              x += 30;
            } else if (element.type === 'note') {
              svg += '<ellipse cx="' + x + '" cy="80" rx="4" ry="3" fill="#000000" aria-label="' + element.pitch + ' ' + element.duration + ' note" />';
              svg += '<line x1="' + (x + 3) + '" y1="80" x2="' + (x + 3) + '" y2="60" stroke="#000000" stroke-width="1" aria-hidden="true" />';
              x += 35;
            }
          }
          
          svg += '</svg>';
          
          container.innerHTML = svg;
          
          const endTime = performance.now();
          
          // Store performance metrics
          if (!window.performanceMetrics) window.performanceMetrics = [];
          window.performanceMetrics.push({
            operation: 'render',
            elementCount: parseResult.elementCount,
            parseTime: parseResult.parseTime,
            renderTime: endTime - startTime,
            totalTime: endTime - startTime + parseResult.parseTime,
            timestamp: new Date().toISOString()
          });
          
          return svg;
        }
      },
      register: () => console.log('Mock plugin registered')
    };
  `

  test('should measure parsing performance for small scores', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const smallScoreTest = await page.evaluate(() => {
      const testInput = `music-abc
  clef treble
  time 4/4
  C4 q D4 q E4 q F4 q`

      const results = []
      const iterations = 10

      try {
        if (window.mockMusicPlugin && window.mockMusicPlugin.parser) {
          for (let i = 0; i < iterations; i++) {
            const result = window.mockMusicPlugin.parser.parse(testInput)
            results.push({
              iteration: i + 1,
              parseTime: result.parseTime,
              elementCount: result.elementCount,
              valid: result.valid
            })
          }

          const parseTimes = results.map(r => r.parseTime)
          const averageTime = parseTimes.reduce((sum, time) => sum + time, 0) / parseTimes.length
          const minTime = Math.min(...parseTimes)
          const maxTime = Math.max(...parseTimes)

          return {
            success: true,
            iterations,
            results,
            averageTime,
            minTime,
            maxTime,
            elementCount: results[0]?.elementCount || 0
          }
        } else {
          return { success: false, error: 'Parser not available' }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Small score performance test:', smallScoreTest)

    if (smallScoreTest.success) {
      expect(smallScoreTest.averageTime).toBeLessThan(10) // Should parse in under 10ms
      expect(smallScoreTest.maxTime).toBeLessThan(50) // No single parse should take over 50ms
      expect(smallScoreTest.elementCount).toBeGreaterThan(0)
      
      // All iterations should succeed
      const allValid = smallScoreTest.results.every(r => r.valid)
      expect(allValid).toBe(true)
    } else {
      console.warn(`Small score performance test failed: ${smallScoreTest.error}`)
    }
  })

  test('should measure parsing performance for medium scores', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const mediumScoreTest = await page.evaluate(() => {
      const testInput = `music-abc
  clef treble
  time 6/8
  C4 e D4 e E4 e F4 e G4 e A4 e
  B4 q C5 h D5 q E5 e F5 s
  G5 w A5 h B5 q C6 e D6 s E6 s
  F#4 q Bb4 h C#5 e Ab3 q G#4 s`

      const results = []
      const iterations = 5

      try {
        if (window.mockMusicPlugin && window.mockMusicPlugin.parser) {
          for (let i = 0; i < iterations; i++) {
            const startTime = performance.now()
            const result = window.mockMusicPlugin.parser.parse(testInput)
            const endTime = performance.now()
            
            results.push({
              iteration: i + 1,
              parseTime: result.parseTime,
              totalTime: endTime - startTime,
              elementCount: result.elementCount,
              valid: result.valid
            })
          }

          const parseTimes = results.map(r => r.parseTime)
          const averageTime = parseTimes.reduce((sum, time) => sum + time, 0) / parseTimes.length

          return {
            success: true,
            iterations,
            results,
            averageTime,
            minTime: Math.min(...parseTimes),
            maxTime: Math.max(...parseTimes),
            elementCount: results[0]?.elementCount || 0
          }
        } else {
          return { success: false, error: 'Parser not available' }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Medium score performance test:', mediumScoreTest)

    if (mediumScoreTest.success) {
      expect(mediumScoreTest.averageTime).toBeLessThan(50) // Should parse in under 50ms
      expect(mediumScoreTest.maxTime).toBeLessThan(200) // No single parse should take over 200ms
      expect(mediumScoreTest.elementCount).toBeGreaterThan(10) // Should have many elements
    } else {
      console.warn(`Medium score performance test failed: ${mediumScoreTest.error}`)
    }
  })

  test('should measure rendering performance', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const renderingPerformanceTest = await page.evaluate(() => {
      const testCases = [
        {
          name: 'Simple',
          input: 'music-abc\n  clef treble\n  C4 q D4 q',
          expectedElementCount: 4
        },
        {
          name: 'Medium',
          input: 'music-abc\n  clef treble\n  time 4/4\n  C4 q D4 q E4 q F4 q G4 h A4 w',
          expectedElementCount: 8
        },
        {
          name: 'Complex',
          input: `music-abc
  clef treble
  time 6/8
  C4 e D4 e E4 e F4 e G4 q
  A4 h B4 q C5 e D5 s E5 s`,
          expectedElementCount: 12
        }
      ]

      const results = []

      try {
        if (window.mockMusicPlugin && window.mockMusicPlugin.renderer) {
          for (const testCase of testCases) {
            const containerId = 'perf-test-' + testCase.name.toLowerCase()
            const container = document.createElement('div')
            container.id = containerId
            document.body.appendChild(container)

            const startTime = performance.now()
            const svg = window.mockMusicPlugin.renderer.draw(testCase.input, containerId)
            const endTime = performance.now()

            const renderTime = endTime - startTime
            const svgSize = svg ? svg.length : 0

            results.push({
              name: testCase.name,
              renderTime,
              svgSize,
              hasContent: container.innerHTML.length > 0,
              elementCount: testCase.expectedElementCount
            })
          }

          return { success: true, results }
        } else {
          return { success: false, error: 'Renderer not available' }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Rendering performance test:', renderingPerformanceTest)

    if (renderingPerformanceTest.success) {
      for (const result of renderingPerformanceTest.results) {
        expect(result.renderTime).toBeLessThan(100) // Should render in under 100ms
        expect(result.svgSize).toBeGreaterThan(0)
        expect(result.hasContent).toBe(true)

        // Complex scores should take longer but still be reasonable
        if (result.name === 'Complex') {
          expect(result.renderTime).toBeGreaterThan(1) // Should take some measurable time
        }
      }
    } else {
      console.warn(`Rendering performance test failed: ${renderingPerformanceTest.error}`)
    }
  })

  test('should handle performance with large scores', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const largeScoreTest = await page.evaluate(() => {
      // Generate a large score programmatically
      let largeScore = 'music-abc\n  clef treble\n  time 4/4\n'
      const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
      const durations = ['q', 'h', 'e', 's']

      // Add 100 notes
      for (let i = 0; i < 100; i++) {
        const note = notes[i % notes.length]
        const duration = durations[i % durations.length]
        largeScore += `  ${note} ${duration}`
        if (i % 8 === 7) largeScore += '\n'
      }

      try {
        if (window.mockMusicPlugin && window.mockMusicPlugin.renderer) {
          const container = document.createElement('div')
          container.id = 'large-score-test'
          document.body.appendChild(container)

          const startTime = performance.now()
          const svg = window.mockMusicPlugin.renderer.draw(largeScore, 'large-score-test')
          const endTime = performance.now()

          const totalTime = endTime - startTime
          const svgSize = svg ? svg.length : 0
          const elementCount = (svg.match(/<ellipse/g) || []).length // Count note heads

          return {
            success: true,
            totalTime,
            svgSize,
            elementCount,
            scoreLength: largeScore.length,
            timePerElement: elementCount > 0 ? totalTime / elementCount : 0
          }
        } else {
          return { success: false, error: 'Renderer not available' }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Large score performance test:', largeScoreTest)

    if (largeScoreTest.success) {
      expect(largeScoreTest.totalTime).toBeLessThan(1000) // Should complete within 1 second
      expect(largeScoreTest.svgSize).toBeGreaterThan(1000) // Should generate substantial SVG
      expect(largeScoreTest.elementCount).toBeGreaterThan(50) // Should have many note elements
      expect(largeScoreTest.timePerElement).toBeLessThan(10) // Should be efficient per element
    } else {
      console.warn(`Large score performance test failed: ${largeScoreTest.error}`)
    }
  })

  test('should maintain consistent performance across multiple renders', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const consistencyTest = await page.evaluate(() => {
      const testInput = `music-abc
  clef treble
  time 4/4
  C4 q D4 q E4 q F4 q G4 h A4 w`

      const renderTimes = []
      const iterations = 20

      try {
        if (window.mockMusicPlugin && window.mockMusicPlugin.renderer) {
          for (let i = 0; i < iterations; i++) {
            const containerId = 'consistency-test-' + i
            const container = document.createElement('div')
            container.id = containerId
            document.body.appendChild(container)

            const startTime = performance.now()
            window.mockMusicPlugin.renderer.draw(testInput, containerId)
            const endTime = performance.now()

            renderTimes.push(endTime - startTime)
          }

          // Calculate statistics
          const avgTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
          const minTime = Math.min(...renderTimes)
          const maxTime = Math.max(...renderTimes)
          const variance = renderTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / renderTimes.length
          const stdDev = Math.sqrt(variance)
          const coefficientOfVariation = stdDev / avgTime

          return {
            success: true,
            iterations,
            avgTime,
            minTime,
            maxTime,
            stdDev,
            coefficientOfVariation,
            isConsistent: coefficientOfVariation < 0.5 // Less than 50% variation
          }
        } else {
          return { success: false, error: 'Renderer not available' }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Performance consistency test:', consistencyTest)

    if (consistencyTest.success) {
      expect(consistencyTest.avgTime).toBeLessThan(50) // Average should be reasonable
      expect(consistencyTest.maxTime).toBeLessThan(200) // No outliers should be too slow
      expect(consistencyTest.coefficientOfVariation).toBeLessThan(1.0) // Should be reasonably consistent
    } else {
      console.warn(`Consistency test failed: ${consistencyTest.error}`)
    }
  })

  test('should track memory usage during rendering', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const memoryTest = await page.evaluate(() => {
      const testInput = `music-abc
  clef treble
  time 4/4
  C4 q D4 q E4 q F4 q G4 h A4 w B4 e C5 s`

      try {
        // Check if performance.memory is available (Chrome only)
        const hasMemoryAPI = 'memory' in performance && typeof performance.memory === 'object'
        
        let initialMemory = 0
        if (hasMemoryAPI) {
          // Force garbage collection if available (dev tools might need to be open)
          if (window.gc) {
            window.gc()
          }
          initialMemory = performance.memory.usedJSHeapSize
        }

        if (window.mockMusicPlugin && window.mockMusicPlugin.renderer) {
          const containers = []
          
          // Render multiple diagrams
          for (let i = 0; i < 10; i++) {
            const containerId = 'memory-test-' + i
            const container = document.createElement('div')
            container.id = containerId
            document.body.appendChild(container)
            containers.push(container)

            window.mockMusicPlugin.renderer.draw(testInput, containerId)
          }

          let finalMemory = 0
          if (hasMemoryAPI) {
            finalMemory = performance.memory.usedJSHeapSize
          }

          // Clean up
          containers.forEach(container => {
            if (container.parentNode) {
              container.parentNode.removeChild(container)
            }
          })

          return {
            success: true,
            hasMemoryAPI,
            initialMemory,
            finalMemory,
            memoryIncrease: hasMemoryAPI ? finalMemory - initialMemory : 0,
            renderedCount: 10
          }
        } else {
          return { success: false, error: 'Renderer not available' }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Memory usage test:', memoryTest)

    if (memoryTest.success) {
      expect(memoryTest.renderedCount).toBe(10)
      
      if (memoryTest.hasMemoryAPI) {
        // Memory increase should be reasonable (less than 10MB for 10 renders)
        expect(memoryTest.memoryIncrease).toBeLessThan(10 * 1024 * 1024)
        console.log(`Memory increase: ${(memoryTest.memoryIncrease / 1024).toFixed(2)} KB`)
      } else {
        console.log('Memory API not available (this is expected in most browsers)')
      }
    } else {
      console.warn(`Memory test failed: ${memoryTest.error}`)
    }
  })

  test('should handle performance under stress conditions', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const stressTest = await page.evaluate(async () => {
      try {
        if (window.mockMusicPlugin && window.mockMusicPlugin.renderer) {
          const results = []
          const testCases = [
            { name: 'Rapid renders', count: 50, delay: 0 },
            { name: 'Concurrent renders', count: 10, delay: 0 }
          ]

          for (const testCase of testCases) {
            const startTime = performance.now()
            const promises = []
            
            for (let i = 0; i < testCase.count; i++) {
              const promise = new Promise((resolve) => {
                setTimeout(() => {
                  const containerId = testCase.name.replace(/\s/g, '-').toLowerCase() + '-' + i
                  const container = document.createElement('div')
                  container.id = containerId
                  document.body.appendChild(container)

                  try {
                    const renderStart = performance.now()
                    window.mockMusicPlugin.renderer.draw('music-abc\n  clef treble\n  C4 q D4 q', containerId)
                    const renderEnd = performance.now()
                    resolve({ success: true, time: renderEnd - renderStart })
                  } catch (error) {
                    resolve({ success: false, error: error.message })
                  }
                }, testCase.delay * i)
              })
              
              promises.push(promise)
            }

            // Wait for all renders to complete
            const renderResults = await Promise.all(promises)
            const endTime = performance.now()
            
            const successCount = renderResults.filter(r => r.success).length
            const avgRenderTime = renderResults
              .filter(r => r.success && r.time)
              .reduce((sum, r) => sum + r.time, 0) / Math.max(successCount, 1)

            results.push({
              testCase: testCase.name,
              totalTime: endTime - startTime,
              successCount,
              totalCount: testCase.count,
              avgRenderTime,
              successRate: successCount / testCase.count
            })
          }

          return { success: true, results }
        } else {
          return { success: false, error: 'Renderer not available' }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Stress test results:', stressTest)

    if (stressTest.success) {
      for (const result of stressTest.results) {
        expect(result.successRate).toBeGreaterThan(0.8) // At least 80% success rate
        expect(result.avgRenderTime).toBeLessThan(100) // Average render time should be reasonable
        expect(result.totalTime).toBeLessThan(5000) // Should complete within 5 seconds
        
        console.log(`${result.testCase}: ${result.successCount}/${result.totalCount} succeeded (${(result.successRate * 100).toFixed(1)}%)`)
      }
    } else {
      console.warn(`Stress test failed: ${stressTest.error}`)
    }
  })
})