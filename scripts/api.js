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

Foursquare.prototype.searchVenues = function(lat, lng, callback) {
    this.makeRequest('venues/search?ll=' + lat + ',' + lng,
                     function(response) { callback(response['response']['groups']) });
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