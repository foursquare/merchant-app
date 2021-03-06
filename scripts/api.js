function Foursquare(apiKey, authUrl, apiUrl) {
  this.apiUrl = apiUrl;
  if ($.bbq.getState('access_token')) {
    // If there is a token in the state, consume it
    this.token = $.bbq.getState('access_token');
    $.bbq.pushState({}, 2)
  } else if ($.bbq.getState('error')) {
  } else {
    this.doAuthRedirect(authUrl, apiKey);
  }
}

Foursquare.prototype.doAuthRedirect = function(authUrl, apiKey) {
  var redirect = window.location.href.replace(window.location.hash, '');
  var url = authUrl + 'oauth2/authenticate?response_type=token&client_id=' + apiKey +
    '&redirect_uri=' + encodeURIComponent(redirect) +
    '&state=' + encodeURIComponent($.bbq.getState('req') || 'users/self');
  window.location.href = url;
};

Foursquare.prototype.makeRequest = function(query, callback) {
    var query = query + ((query.indexOf('?') > -1) ? '&' : '?') + 'oauth_token=' + this.token + '&callback=?';
    $.getJSON(this.apiUrl + 'v2/' + query, {}, callback);
};

Foursquare.prototype.venuesManaged = function(callback) {
    this.makeRequest('venues/managed',
                     function(response) { callback(response['response']['venues'][0]) });
};

Foursquare.prototype.venue = function(id, callback) {
    this.makeRequest('venues/' + id,
                     function(response) { callback(response['response']['venue']) });
};

Foursquare.prototype.herenow = function(id, callback) {
    this.makeRequest('venues/' + id + '/herenow',
                     function(response) { callback(response['response']['hereNow']) });
};

/**
 * Helper utility duplicating goog.bind from Closure, useful for creating object-oriented callbacks.
 * something(bind(this.foo, this)) is equiavlent to var self = obj; something(function() { self.foo });
 */
function bind(f, obj) {
    return function() {
	f.apply(obj, arguments);
    }
}

Foursquare.prototype.listSpecials = function(callback) {
    this.makeRequest('specials/list',
                     function(response) { callback(response['response']['specials']) });
};


Foursquare.prototype.getSpecial = function(specialId, callback) {
    this.makeRequest('specials/' + specialId + '/configuration',
                     function(response) { callback(response['response']['special']) });
};

Foursquare.prototype.listCampaigns = function(callback) {
    this.makeRequest('campaigns/list?status=active',
                     function(response) { callback(response['response']['campaigns']) });
};

Foursquare.prototype.activateSpecial = function(specialId, venueId, callback) {
    this.postRequest('activateSpecialForm', { specialId: specialId, venueId: venueId },
                     function(response) { callback(response['response']['campaign'])
   });
};

Foursquare.prototype.deactivateCampaign = function(campaignId, callback) {
    this.postRequest('deactivateSpecialForm', { action: this.apiUrl + '/v2/campaigns/' + campaignId + '/end' },
                     function(response) { callback(response['response']['campaign']) });
};

Foursquare.prototype.stats = function(vid, callback) {
    this.makeRequest('venues/' + vid + '/stats',
                     function(response) { callback(response['response']['stats']) });
};


Foursquare.prototype.postRequest = function(formId, data) {
    data['oauth_token'] = this.token;
    var form = $('#'+formId);
    for (key in data) {
	if (key == 'action') {
	    form.attr('action', data[key]);
	} else {
	    $('#'+formId+' #'+key).val(data[key]);
	}
    }
    form.submit();
};
