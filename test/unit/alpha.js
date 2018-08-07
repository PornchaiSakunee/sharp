'use strict';

const assert = require('assert');
const fixtures = require('../fixtures');
const sharp = require('../../');

describe('Alpha transparency', function () {
  it('Flatten to black', function (done) {
    sharp(fixtures.inputPngWithTransparency)
      .flatten()
      .resize(400, 300)
      .toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual(400, info.width);
        assert.strictEqual(300, info.height);
        fixtures.assertSimilar(fixtures.expected('flatten-black.jpg'), data, done);
      });
  });

  it('Flatten to RGB orange', function (done) {
    sharp(fixtures.inputPngWithTransparency)
      .flatten()
      .background({r: 255, g: 102, b: 0})
      .resize(400, 300)
      .toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual(400, info.width);
        assert.strictEqual(300, info.height);
        fixtures.assertSimilar(fixtures.expected('flatten-orange.jpg'), data, done);
      });
  });

  it('Flatten to CSS/hex orange', function (done) {
    sharp(fixtures.inputPngWithTransparency)
      .flatten()
      .background('#ff6600')
      .resize(400, 300)
      .toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual(400, info.width);
        assert.strictEqual(300, info.height);
        fixtures.assertSimilar(fixtures.expected('flatten-orange.jpg'), data, done);
      });
  });

  it('Flatten 16-bit PNG with transparency to orange', function (done) {
    const output = fixtures.path('output.flatten-rgb16-orange.jpg');
    sharp(fixtures.inputPngWithTransparency16bit)
      .flatten()
      .background({r: 255, g: 102, b: 0})
      .toFile(output, function (err, info) {
        if (err) throw err;
        assert.strictEqual(true, info.size > 0);
        assert.strictEqual(32, info.width);
        assert.strictEqual(32, info.height);
        fixtures.assertMaxColourDistance(output, fixtures.expected('flatten-rgb16-orange.jpg'), 25);
        done();
      });
  });

  it('Do not flatten', function (done) {
    sharp(fixtures.inputPngWithTransparency)
      .flatten(false)
      .toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual('png', info.format);
        assert.strictEqual(4, info.channels);
        done();
      });
  });

  it('Ignored for JPEG', function (done) {
    sharp(fixtures.inputJpg)
      .background('#ff0000')
      .flatten()
      .toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual('jpeg', info.format);
        assert.strictEqual(3, info.channels);
        done();
      });
  });

  it('Enlargement with non-nearest neighbor interpolation shouldn’t cause dark edges', function () {
    const base = 'alpha-premultiply-enlargement-2048x1536-paper.png';
    const actual = fixtures.path('output.' + base);
    const expected = fixtures.expected(base);
    return sharp(fixtures.inputPngAlphaPremultiplicationSmall)
      .resize(2048, 1536)
      .toFile(actual)
      .then(function () {
        fixtures.assertMaxColourDistance(actual, expected, 102);
      });
  });

  it('Reduction with non-nearest neighbor interpolation shouldn’t cause dark edges', function () {
    const base = 'alpha-premultiply-reduction-1024x768-paper.png';
    const actual = fixtures.path('output.' + base);
    const expected = fixtures.expected(base);
    return sharp(fixtures.inputPngAlphaPremultiplicationLarge)
      .resize(1024, 768)
      .toFile(actual)
      .then(function () {
        fixtures.assertMaxColourDistance(actual, expected, 102);
      });
  });

  it('Removes alpha from fixtures with transparency, ignores those without', function () {
    return Promise.all([
      fixtures.inputPngWithTransparency,
      fixtures.inputPngWithTransparency16bit,
      fixtures.inputWebPWithTransparency,
      fixtures.inputJpg,
      fixtures.inputPng,
      fixtures.inputWebP
    ].map(function (input) {
      return sharp(input)
        .removeAlpha()
        .toBuffer({ resolveWithObject: true })
        .then(function (result) {
          assert.strictEqual(3, result.info.channels);
        });
    }));
  });
});
