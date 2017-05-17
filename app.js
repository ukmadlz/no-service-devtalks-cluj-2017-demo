$(document).ready(function() {

  // Remove the spinner
  $('#messageOutput #spinner').remove();

  // If you've got a name
  if (typeof Storage !== 'undefined') {
    var username = localStorage.getItem('username');
    if (typeof url == 'string') {
      $('#user').val(username)
    }
  }

  // Template
  var addMention = function(data) {
    var dateObj = new Date(data.doc.timestamp);
    var html = '<div class=\"row\" id=\"' + data.doc._id + '\" data-timestamp=\"' + dateObj.getTime() + '\">';
    html += '<p><strong>' + santise(data.doc.user) + ': ' + dateObj.toString() + '</strong></p>';
    html += marked(data.doc.message);
    html += '<div class=\"\" >';

    html += '<pre class=\"hide\" ><code>';
    html += JSON.stringify(data.doc.insights, null, ' ');
    html += '</code></pre>';
    html += '</div>';

    if (typeof $('#' + data.doc._id).html() == 'undefined') {
      $('#messageOutput').prepend(html);
    } else {
      $('#' + data.doc._id).html(html);
    }

  };

  var sortMessage = function() {
    var ul = $('#messageOutput');
    var arr = $.makeArray(ul.children('div.row'));

    arr.sort(function(a, b) {
      var textA = +$(a).attr('data-timestamp');
      var textB = +$(b).attr('data-timestamp');

      if (textA < textB) return 1;
      if (textA > textB) return -1;

      return 0;
    });

    ul.empty();

    $.each(arr, function() {
      ul.append(this);
    });
  };

  var santise = function(str) {
    return str.replace(/(<([^>]+)>)/ig, '');
  };

  $('#chat').on('submit', function(e) {
    e.preventDefault();
    var username = $('#user').val();
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('username', username);
    }
  });

  // The APP
  var db = PouchDB('devtalkscluj');

  // Save new doc
  $('#chat').on('submit', function(e) {

    e.preventDefault();

    var doc = {
      user: $('#user').val(),
      message: $('#message').val(),
      timestamp: (new Date).toISOString(),
    };

    db.post(doc, function(err, body) {
      if (err) {
        console.log(err);
      } else {
        $('#message').val('');
        $('#user').attr('disabled', 'disabled');
      }
    });

    return false;
  });

  // Display all IM's
  db.allDocs({ include_docs: true }, function(err, resp) {
    for (var i = 0; i < resp.rows.length; i++) {
      var data = resp.rows[i];
      addMention(data);
      if (i == resp.rows.length - 2) {
        sortMessage();
      }
    }
  });

  // See changes
  db.changes({
    since: 'now',
    live: true,
    include_docs: true,
  }).on('change', function(change) {
    // handle change
    addMention(change);
    sortMessage();
  }).on('complete', function(info) {
    // changes() was canceled
  }).on('error', function(err) {
    console.log(err);
  });

  // Sync to CouchDB
  var remoteUrl = 'https://elsmore.cloudant.com/devtalkscluj';
  db.sync(remoteUrl, {
    live: true,
    retry: true,
  });


});
