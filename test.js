'use strict';

var assert = require('proclaim');
var fs = require('fs');
var request = require('request');
var venueData = require('./data/venues.json');

var baseUrl = process.env.BACKEND || 'http://localhost:5000';
baseUrl = baseUrl.replace(/\/+$/, '');

describe('Example Back End', function() {

	describe('Home', function() {

		requestUrl('/');

		it('Should respond with a 200 status', function() {
			assert.strictEqual(this.lastStatusCode, 200);
		});

		it('Should respond with Shunter JSON', function() {
			assert.isTrue((this.lastContentType === 'application/x-shunter+json; charset=utf-8' || 'application/x-shunter+json'));
			assert.isNotNull(this.lastJson);
			assert.isObject(this.lastJson);
		});

		it('Should respond with the expected JSON structure', function() {
			assert.deepEqual(this.lastJson, {
				layout: {
					template: 'home'
				},
				data: {
					title: 'Lunch Places',
					venues: venueData
				}
			});
		});

	});

	describe('Venue', function() {

		requestUrl('/the-craft-beer-co');

		it('Should respond with a 200 status', function() {
			assert.strictEqual(this.lastStatusCode, 200);
		});

		it('Should respond with Shunter JSON', function() {
			assert.isTrue((this.lastContentType === 'application/x-shunter+json; charset=utf-8' || 'application/x-shunter+json'));
			assert.isNotNull(this.lastJson);
			assert.isObject(this.lastJson);
		});

		it('Should respond with the expected JSON structure', function() {
			assert.deepEqual(this.lastJson, {
				layout: {
					template: 'venue'
				},
				data: {
					title: 'The Craft Beer Co. - Lunch Places',
					venue: venueData[0]
				}
			});
		});

	});

	describe('Venue image', function() {

		requestUrl('/the-craft-beer-co.jpg');

		it('Should respond with a 200 status', function() {
			assert.strictEqual(this.lastStatusCode, 200);
		});

		it('Should respond with a JPEG', function() {
			assert.strictEqual(this.lastContentType, 'image/jpeg');
		});

		it('Should respond with the expected image data', function() {
			assert.deepEqual(this.lastBody, fs.readFileSync(__dirname + '/data/the-craft-beer-co.jpg', 'utf-8'));
		});

	});

	describe('Random', function() {

		requestUrl('/random');

		it('Should respond with a 302 status', function() {
			assert.strictEqual(this.lastStatusCode, 302);
		});

		it('Should respond with a Location header that corresponds to a venue page', function() {
			assert.include([
				'/the-craft-beer-co',
				'/the-three-johns',
				'/honest-burgers'
			], this.lastResponse.headers.location);
		});

	});

	describe('404', function() {

		requestUrl('/404');

		it('Should respond with a 404 status', function() {
			assert.strictEqual(this.lastStatusCode, 404);
		});

	});

});

function requestUrl(endpoint) {
	before(function(done) {
		var suite = this;
		var options = {
			followRedirect: false
		};
		request(baseUrl + endpoint, options, function(error, response, body) {
			if (error) {
				return done(error);
			}
			suite.lastResponse = response;
			suite.lastStatusCode = response.statusCode;
			suite.lastContentType = response.headers['content-type'];
			suite.lastBody = body;
			suite.lastJson = null;
			try {
				suite.lastJson = JSON.parse(body);
			} catch (error) {}
			done();
		});
	});
}
