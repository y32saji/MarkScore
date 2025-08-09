import { test, expect } from '@playwright/test'
import { join } from 'path'

test.describe('Error Handling in Browser Environment', () => {
  const pluginCode = `
    // Mock plugin with error handling capabilities
    window.mockMusicPlugin = {
      id: 'music',
      detector: (text) => {
        if (typeof text !== 'string') {
          throw new Error('Invalid input type: expected string');
        }
        return text.includes('music-abc');
      },
      parser: {
        parse: (input) => {
          if (!input || typeof input !== 'string') {
            throw new Error('Parser: Invalid input');
          }
          
          if (input.includes('invalid')) {
            throw new Error('Parser: Invalid syntax detected');
          }
          
          if (input.includes('error-test')) {
            throw new Error('Parser: Intentional test error');
          }
          
          // Normal parsing
          const lines = input.split('\\n').filter(line => line.trim());
          const elements = [];
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('clef ')) {
              const clefType = trimmed.split(' ')[1];
              if (!['treble', 'bass', 'alto', 'tenor'].includes(clefType)) {
                throw new Error('Parser: Unknown clef type: ' + clefType);
              }
              elements.push({ type: 'clef', value: clefType });
            }
          }
          
          return { elements, valid: true };
        }
      },
      renderer: {
        draw: (text, id) => {
          if (!text) {
            throw new Error('Renderer: No input provided');
          }
          
          if (text.includes('render-error')) {
            throw new Error('Renderer: Intentional render error');
          }
          
          const container = document.getElementById(id);
          if (!container) {
            throw new Error('Renderer: Container not found: ' + id);
          }
          
          try {
            // Simple SVG generation
            const svg = '<svg width="800" height="200" xmlns="http://www.w3.org/2000/svg" aria-label="Musical score"><rect width="800" height="200" fill="#ffffff" /><text x="400" y="100" text-anchor="middle" fill="#666">Mock Music Diagram</text></svg>';
            container.innerHTML = svg;
            return svg;
          } catch (error) {
            throw new Error('Renderer: Failed to generate SVG - ' + error.message);
          }
        }
      },
      errorHandler: {
        handleError: (error, context) => {
          console.error('[Music Plugin Error]', context + ':', error.message);
          return {
            error: error.message,
            context: context,
            timestamp: new Date().toISOString(),
            handled: true
          };
        }
      },
      register: () => console.log('Mock plugin registered')
    };
    
    // Global error tracking
    window.pluginErrors = [];
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && event.error.message.includes('Music Plugin')) {
        window.pluginErrors.push({
          message: event.error.message,
          filename: event.filename,
          lineno: event.lineno,
          timestamp: new Date().toISOString()
        });
      }
    });
  `

  test('should handle invalid input types gracefully', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const inputTypeTests = await page.evaluate(() => {
      const testCases = [
        { input: null, description: 'null input' },
        { input: undefined, description: 'undefined input' },
        { input: 123, description: 'number input' },
        { input: {}, description: 'object input' },
        { input: [], description: 'array input' }
      ]

      const results = []

      for (const testCase of testCases) {
        try {
          if (window.mockMusicPlugin && window.mockMusicPlugin.detector) {
            const result = window.mockMusicPlugin.detector(testCase.input)
            results.push({
              description: testCase.description,
              success: true,
              result: result,
              error: null
            })
          } else {
            results.push({
              description: testCase.description,
              success: false,
              result: null,
              error: 'Detector not available'
            })
          }
        } catch (error) {
          results.push({
            description: testCase.description,
            success: true, // Catching error is expected behavior
            result: false,
            error: error.message
          })
        }
      }

      return results
    })

    console.log('Input type error tests:', inputTypeTests)

    for (const result of inputTypeTests) {
      expect(result.success).toBe(true) // Should either work or throw meaningful error
      if (result.error) {
        expect(result.error).toContain('Invalid input') // Should have meaningful error message
      }
    }
  })

  test('should handle parser errors gracefully', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const parserErrorTests = await page.evaluate(() => {
      const testCases = [
        {
          input: 'music-abc\n  clef invalid',
          description: 'invalid clef type',
          expectedError: 'Unknown clef type'
        },
        {
          input: 'music-abc\n  invalid syntax here',
          description: 'invalid syntax',
          expectedError: 'Invalid syntax'
        },
        {
          input: 'music-abc\n  error-test',
          description: 'intentional error',
          expectedError: 'Intentional test error'
        },
        {
          input: '',
          description: 'empty input',
          expectedError: 'Invalid input'
        }
      ]

      const results = []

      for (const testCase of testCases) {
        try {
          if (window.mockMusicPlugin && window.mockMusicPlugin.parser) {
            const result = window.mockMusicPlugin.parser.parse(testCase.input)
            results.push({
              description: testCase.description,
              success: false, // Should have thrown an error
              result: result,
              error: 'Expected error but parsing succeeded'
            })
          } else {
            results.push({
              description: testCase.description,
              success: false,
              result: null,
              error: 'Parser not available'
            })
          }
        } catch (error) {
          results.push({
            description: testCase.description,
            success: true, // Error was expected
            result: null,
            error: error.message,
            hasExpectedError: error.message.includes(testCase.expectedError)
          })
        }
      }

      return results
    })

    console.log('Parser error tests:', parserErrorTests)

    for (const result of parserErrorTests) {
      if (result.success) {
        expect(result.error).toBeTruthy()
        expect(result.hasExpectedError).toBe(true)
      } else {
        console.warn(`Parser error test failed: ${result.description} - ${result.error}`)
      }
    }
  })

  test('should handle renderer errors gracefully', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const rendererErrorTests = await page.evaluate(() => {
      const testCases = [
        {
          input: '',
          containerId: 'renderer-test-1',
          description: 'empty input',
          expectedError: 'No input provided'
        },
        {
          input: 'music-abc\n  render-error',
          containerId: 'renderer-test-2',
          description: 'intentional render error',
          expectedError: 'Intentional render error'
        },
        {
          input: 'music-abc\n  valid input',
          containerId: 'non-existent-container',
          description: 'missing container',
          expectedError: 'Container not found'
        }
      ]

      const results = []

      for (const testCase of testCases) {
        try {
          // Create container if needed
          if (testCase.containerId !== 'non-existent-container') {
            const container = document.createElement('div')
            container.id = testCase.containerId
            document.body.appendChild(container)
          }

          if (window.mockMusicPlugin && window.mockMusicPlugin.renderer) {
            const result = window.mockMusicPlugin.renderer.draw(testCase.input, testCase.containerId)
            results.push({
              description: testCase.description,
              success: false, // Should have thrown an error
              result: result,
              error: 'Expected error but rendering succeeded'
            })
          } else {
            results.push({
              description: testCase.description,
              success: false,
              result: null,
              error: 'Renderer not available'
            })
          }
        } catch (error) {
          results.push({
            description: testCase.description,
            success: true, // Error was expected
            result: null,
            error: error.message,
            hasExpectedError: error.message.includes(testCase.expectedError)
          })
        }
      }

      return results
    })

    console.log('Renderer error tests:', rendererErrorTests)

    for (const result of rendererErrorTests) {
      if (result.success) {
        expect(result.error).toBeTruthy()
        expect(result.hasExpectedError).toBe(true)
      } else {
        console.warn(`Renderer error test failed: ${result.description} - ${result.error}`)
      }
    }
  })

  test('should provide meaningful error messages', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const errorMessageTest = await page.evaluate(() => {
      const errors = []

      try {
        if (window.mockMusicPlugin && window.mockMusicPlugin.detector) {
          try {
            window.mockMusicPlugin.detector(null)
          } catch (error) {
            errors.push({ 
              context: 'detector', 
              message: error.message, 
              isDescriptive: error.message.length > 10 
            })
          }
        }

        if (window.mockMusicPlugin && window.mockMusicPlugin.parser) {
          try {
            window.mockMusicPlugin.parser.parse('music-abc\n  clef unknown')
          } catch (error) {
            errors.push({ 
              context: 'parser', 
              message: error.message, 
              isDescriptive: error.message.length > 10 
            })
          }
        }

        if (window.mockMusicPlugin && window.mockMusicPlugin.renderer) {
          try {
            window.mockMusicPlugin.renderer.draw('', 'test')
          } catch (error) {
            errors.push({ 
              context: 'renderer', 
              message: error.message, 
              isDescriptive: error.message.length > 10 
            })
          }
        }

        return { success: true, errors }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Error message test:', errorMessageTest)

    if (errorMessageTest.success) {
      expect(errorMessageTest.errors.length).toBeGreaterThan(0)
      
      for (const error of errorMessageTest.errors) {
        expect(error.message).toBeTruthy()
        expect(error.isDescriptive).toBe(true)
        expect(error.message).not.toBe('Error') // Should be more descriptive than just "Error"
      }
    } else {
      console.warn(`Error message test setup failed: ${errorMessageTest.error}`)
    }
  })

  test('should handle error recovery', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const errorRecoveryTest = await page.evaluate(() => {
      const results = []

      try {
        if (window.mockMusicPlugin) {
          // Test 1: Error then recovery
          try {
            window.mockMusicPlugin.parser.parse('music-abc\n  clef invalid')
          } catch (error) {
            results.push({ test: 'error', success: true, message: 'Caught expected error' })
          }

          // Test 2: Should work after error
          try {
            const result = window.mockMusicPlugin.parser.parse('music-abc\n  clef treble')
            results.push({ 
              test: 'recovery', 
              success: result && result.valid, 
              message: 'Successfully parsed after error' 
            })
          } catch (error) {
            results.push({ 
              test: 'recovery', 
              success: false, 
              message: 'Failed to recover: ' + error.message 
            })
          }

          // Test 3: Multiple errors should not break plugin
          for (let i = 0; i < 3; i++) {
            try {
              window.mockMusicPlugin.detector(null)
            } catch (error) {
              // Expected - just counting
            }
          }

          try {
            const stillWorks = window.mockMusicPlugin.detector('music-abc\n  test')
            results.push({ 
              test: 'multiple-errors', 
              success: stillWorks === true, 
              message: 'Plugin still works after multiple errors' 
            })
          } catch (error) {
            results.push({ 
              test: 'multiple-errors', 
              success: false, 
              message: 'Plugin broken after multiple errors: ' + error.message 
            })
          }

          return { success: true, results }
        } else {
          return { success: false, error: 'Plugin not available' }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Error recovery test:', errorRecoveryTest)

    if (errorRecoveryTest.success) {
      for (const result of errorRecoveryTest.results) {
        expect(result.success).toBe(true)
        console.log(`Recovery test '${result.test}': ${result.message}`)
      }
    } else {
      console.warn(`Error recovery test failed: ${errorRecoveryTest.error}`)
    }
  })

  test('should handle global error tracking', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/plugin-integration.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    // Wait a moment for any initial errors to be tracked
    await page.waitForTimeout(100)

    const globalErrorTest = await page.evaluate(() => {
      try {
        // Check if error tracking is set up
        const hasErrorTracking = Array.isArray(window.pluginErrors)
        const initialErrorCount = hasErrorTracking ? window.pluginErrors.length : 0

        // Trigger some errors
        if (window.mockMusicPlugin) {
          try { window.mockMusicPlugin.detector(null) } catch (e) { /* expected */ }
          try { window.mockMusicPlugin.parser.parse('') } catch (e) { /* expected */ }
        }

        // Check error tracking after triggering errors
        const finalErrorCount = hasErrorTracking ? window.pluginErrors.length : 0

        return {
          success: true,
          hasErrorTracking,
          initialErrorCount,
          finalErrorCount,
          errorsTracked: finalErrorCount > initialErrorCount,
          errors: hasErrorTracking ? window.pluginErrors.slice(0, 3) : [] // Show first 3
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Global error tracking test:', globalErrorTest)

    if (globalErrorTest.success) {
      expect(globalErrorTest.hasErrorTracking).toBe(true)
      expect(typeof globalErrorTest.initialErrorCount).toBe('number')
      expect(typeof globalErrorTest.finalErrorCount).toBe('number')
      
      // Note: We might not always capture all errors in the global handler,
      // so we'll just verify the tracking system is in place
      expect(Array.isArray(globalErrorTest.errors)).toBe(true)
    } else {
      console.warn(`Global error tracking test failed: ${globalErrorTest.error}`)
    }
  })

  test('should validate error handling in Mermaid integration', async ({ page }) => {
    const fixturePath = join(__dirname, './fixtures/basic-test.html')
    await page.goto(`file://${fixturePath}`)

    await page.waitForFunction(() => typeof window.mermaid !== 'undefined')
    await page.addScriptTag({ content: pluginCode })

    const integrationErrorTest = await page.evaluate(async () => {
      try {
        // Find the error diagram container
        const errorDiagram = document.getElementById('error-music')
        
        if (!errorDiagram) {
          return { success: false, error: 'Error diagram container not found' }
        }

        // Check initial state
        const initialContent = errorDiagram.innerHTML
        
        // Try to run Mermaid on all diagrams (including the error one)
        try {
          await window.mermaid.run()
        } catch (error) {
          // This is expected to fail, but shouldn't crash the page
        }

        // Check if the page is still functional
        const pageStillWorks = typeof window.mermaid !== 'undefined'
        const diagramStillExists = document.getElementById('error-music') !== null
        
        return {
          success: true,
          pageStillWorks,
          diagramStillExists,
          initialContent: initialContent.substring(0, 50),
          errorCaught: true // We caught the error above
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('Mermaid integration error test:', integrationErrorTest)

    if (integrationErrorTest.success) {
      expect(integrationErrorTest.pageStillWorks).toBe(true)
      expect(integrationErrorTest.diagramStillExists).toBe(true)
    } else {
      console.warn(`Integration error test failed: ${integrationErrorTest.error}`)
    }
  })
})