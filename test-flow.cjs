const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const screenshots = [];

  // Auto-dismiss dialogs (window.confirm)
  page.on('dialog', async dialog => {
    console.log(`  [DIALOG] ${dialog.type()}: ${dialog.message()}`);
    await dialog.accept();
  });

  // Log API responses for debugging
  page.on('response', async resp => {
    if (resp.url().includes('/avaliacoes/vo2max') && resp.status() === 200) {
      try {
        const body = await resp.json();
        console.log('  [API RESPONSE] /avaliacoes/vo2max:', JSON.stringify(body, null, 2));
      } catch {}
    }
  });

  async function screenshot(name) {
    const path = `C:\\Users\\gabri\\Documents\\projetos\\proinsight-web\\test-screenshots\\${name}.png`;
    await page.screenshot({ path, fullPage: false });
    screenshots.push(path);
    console.log(`  Screenshot: ${name}`);
  }

  try {
    // ── 1. Login ──
    console.log('\n=== 1. LOGIN ===');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await screenshot('01-login');

    await page.fill('input[type="text"], input[name="login"], input[placeholder*="usuário"], input[placeholder*="email"], input[placeholder*="login"]', 'teste321');
    await page.fill('input[type="password"]', '12345678');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await screenshot('02-after-login');

    // ── 2. Navigate to nova avaliação ──
    console.log('\n=== 2. NOVA AVALIACAO ===');
    await page.goto('http://localhost:5173/avaliacao/nova', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot('03-step1-choose-client');

    // ── 3. Select client ──
    console.log('\n=== 3. SELECT CLIENT ===');
    await page.click('button:has-text("Gabriel Henrique")', { timeout: 5000 });
    await page.waitForTimeout(1500);
    await screenshot('04-step2-protocol');

    // ── 4. Click FeaturedCard "Iniciar avaliação" via coordinates ──
    console.log('\n=== 4. START EVALUATION ===');
    const iniciarDiv = page.locator('div.bg-primary:has-text("Iniciar avaliação")').first();
    await iniciarDiv.click({ timeout: 5000 });
    await page.waitForTimeout(3000);

    // Wait for wizard to load
    try {
      await page.waitForSelector('button:has-text("Próximo")', { timeout: 15000 });
      console.log('  Wizard loaded!');
    } catch {
      console.log('  Wizard did not load, trying fallback...');
      await page.goto('http://localhost:5173/avaliacao/nova', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.click('button:has-text("Gabriel Henrique")', { timeout: 5000 });
      await page.waitForTimeout(1500);
      // Click using coordinates on the FeaturedCard's green bar
      const box = await page.locator('div.bg-primary:has-text("Iniciar avaliação")').first().boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      }
      await page.waitForTimeout(3000);
      await page.waitForSelector('button:has-text("Próximo")', { timeout: 15000 });
    }
    await screenshot('05-wizard-step0-dados');

    // ── 5. Fill in peso and altitude (pre-dados returned 500, so fields are empty) ──
    console.log('\n=== 5. FILL DADOS ===');
    // Peso
    const pesoInput = page.locator('input[placeholder="kg"]');
    await pesoInput.fill('75');
    // Altura
    const alturaInput = page.locator('input[placeholder="cm"]');
    await alturaInput.fill('180');
    await page.waitForTimeout(500);
    await screenshot('06-wizard-step0-filled');

    // ── 6. Click "Próximo" ──
    console.log('\n=== 6. STEP 0 → PRÓXIMO ===');
    const proximoBtn = page.locator('button:has-text("Próximo")');
    await proximoBtn.click();
    await page.waitForTimeout(1500);
    await screenshot('07-wizard-step1-config');

    // ── 7. Click "Iniciar Teste" ──
    console.log('\n=== 7. INICIAR TESTE ===');
    const iniciarTeste = page.locator('button:has-text("Iniciar Teste")');
    await iniciarTeste.click();
    await page.waitForTimeout(2000);
    await screenshot('08-wizard-step1-running');

    // ── 8. Register HR readings ──
    console.log('\n=== 8. HR READINGS ===');
    const hrInput = page.locator('input[placeholder="FC"]');
    for (const bpm of [120, 145, 168]) {
      await hrInput.fill(String(bpm));
      await page.waitForTimeout(300);
      await page.locator('button:has-text("Registrar")').click();
      await page.waitForTimeout(500);
    }
    await screenshot('09-wizard-step1-hr');
    console.log('  3 HR readings registered');

    // ── 9. Finalize test ──
    console.log('\n=== 9. FINALIZE ===');
    await page.locator('button:has-text("Finalizar")').click();
    await page.waitForTimeout(1500);
    await screenshot('10-wizard-step2-observations');

    // ── 10. Fill observations and submit ──
    console.log('\n=== 10. SUBMIT ===');
    const textarea = page.locator('textarea');
    await textarea.fill('Avaliação de teste via Playwright - Todos os fluxos OK');
    await page.locator('button:has-text("Enviar Resultado")').click();

    // Wait for result
    try {
      await page.waitForSelector('button:has-text("Nova avaliação")', { timeout: 10000 });
      console.log('  Result received!');
    } catch {
      console.log('  Timeout waiting for result');
    }
    await page.waitForTimeout(1000);
    await screenshot('11-wizard-step2-result');

    // ── 11. Verify result screen ──
    console.log('\n=== 11. RESULT CHECKS ===');
    const content = await page.textContent('body');
    for (const [k, v] of Object.entries({
      'VO₂max': content.includes('VO₂max'),
      'METs': content.includes('METs'),
      'FC Registradas': content.includes('FC Registradas'),
      'Nova avaliação': content.includes('Nova avaliação'),
      'Concluir': content.includes('Concluir'),
      'mL/kg/min': content.includes('mL/kg/min'),
      'classificação': content.includes('Ruim') || content.includes('Muito') || content.includes('Bom') || content.includes('Regular'),
    })) console.log(`  ${v ? '✓' : '✗'} ${k}`);

    // Full page screenshot
    await page.screenshot({ path: 'C:\\Users\\gabri\\Documents\\projetos\\proinsight-web\\test-screenshots\\12-result-full.png', fullPage: true });
    console.log('  Screenshot: 12-result-full (fullPage)');

    // ── 12. Test "Nova avaliação" button ──
    console.log('\n=== 12. NOVA AVALIACAO BUTTON ===');
    // There are 2 "Nova avaliação" buttons (sidebar + wizard). Target the wizard's one.
    const novaBtn = page.locator('button:has-text("Nova avaliação")').last();
    await novaBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await novaBtn.click({ force: true });
    await page.waitForTimeout(2000);
    await screenshot('13-back-to-protocol');
    const backContent = await page.textContent('body');
    const backToProtocol = backContent.includes('Selecione a avaliação') || backContent.includes('Protocolo');
    console.log(`  Back to protocol selection: ${backToProtocol}`);
    console.log(`  URL: ${page.url()}`);

    console.log(`\n=== DONE (${screenshots.length} screenshots) ===`);

  } catch (err) {
    console.error('Erro:', err.message);
    await screenshot('ERROR');
  } finally {
    await browser.close();
  }
})();
