var home = false,
    tagsListLoaded = false,
    tagsLoaded = false,
    tagsArr = [],
    currentTag = 'none',
    tagList = $("#tagList"),
    tagsInit = false,
    tagToGrab, tracksToPlay;

var Playlist = function (instance, playlist, options) {

    var self = this;
    this._instance_id = String(Math.random());

    this.instance = instance; // String: To associate specific HTML with this playlist
    this.playlist = playlist; // Array of Objects: The playlist
    this.options = options; // Object: The jPlayer constructor options for this playlist

    this.current = 0;

    this.cssId = {
      jPlayer: "jquery_jplayer_",
      interface: "jp_interface_",
      playlist: "jp_playlist_"
    };

    this.cssSelector = {};

    $.each(this.cssId, function (entity, id) {
      self.cssSelector[entity] = "#" + id + self.instance;
    });

    if (!this.options.cssSelectorAncestor) {
      this.options.cssSelectorAncestor = this.cssSelector.interface;
    }


    $(this.cssSelector.jPlayer).jPlayer(this.options);

    $(this.cssSelector.interface + " .jp-previous").click(function () {
      self.playlistPrev();
      $(this).blur();
      return false;
    });

    $(this.cssSelector.interface + " .jp-previous").tap(function () {
      self.playlistPrev();
      $(this).blur();
      return false;
    });

    $(this.cssSelector.interface + " .jp-next").click(function () {
      self.playlistNext();
      $(this).blur();
      return false;
    });

    $(this.cssSelector.interface + " .jp-next").tap(function () {
      self.playlistNext();
      $(this).blur();
      return false;
    });

    };
Playlist.prototype = {
  displayPlaylist: function () {

    var self = this;



    $(this.cssSelector.playlist + " ul").empty();
    for (i = 0; i < this.playlist.length; i++) {
      var listItem = (i === this.playlist.length - 1) ? "<li class='jp-playlist-last'>" : "<li>";
      listItem += "<a href='#' id='" + this.cssId.playlist + this.instance + "_item_" + i + "' tabindex='1'>" + this.playlist[i].name + "</a></li>";
      // Associate playlist items with their media
      $(this.cssSelector.playlist + " ul").append(listItem);
      $(this.cssSelector.playlist + "_item_" + i).data("index", i).click(function () {
        var index = $(this).data("index");

        if (self.current !== index) {
          self.playlistChange(index);
        } else {
          $(self.cssSelector.jPlayer).jPlayer("play");
        }
        $(this).blur();
        return false;
      });
    };
  },
  playlistInit: function (autoplay) {
    if (autoplay) {
      this.playlistChange(this.current);
    } else {
      this.playlistConfig(this.current);
    }
  },
  playlistConfig: function (index) {
    $(this.cssSelector.playlist + "_item_" + this.current).removeClass("jp-playlist-current").parent().removeClass("jp-playlist-current");
    $(this.cssSelector.playlist + "_item_" + index).addClass("jp-playlist-current").parent().addClass("jp-playlist-current");
    this.current = index;
    $(this.cssSelector.jPlayer).jPlayer("setMedia", this.playlist[this.current]);
  },
  playlistChange: function (index) {
    this.playlistConfig(index);
    $(this.cssSelector.jPlayer).jPlayer("play");
  },
  playlistNext: function () {
    var index = (this.current + 1 < this.playlist.length) ? this.current + 1 : 0;
    this.playlistChange(index);
  },
  playlistPrev: function () {
    var index = (this.current - 1 >= 0) ? this.current - 1 : this.playlist.length - 1;
    this.playlistChange(index);
  }
};


$(document).ready(function () {


  $("#home").bind("pageshow", function (event, ui) {
    //load home only if home has not been loaded
    if (!home) {
      loadHome();
    }
  });

  $("#tags").bind("pageshow", function (event, ui) {
    //load home only if home has not been loaded
    if (!tagsLoaded) {
      loadTags();
      $.mobile.hidePageLoadingMsg();
    }
  });

  $("#tags").bind("pagebeforeshow", function (event, ui) {
    if (!tagsInit) {
      tagList.listview();
      tagList.listview("refresh");
    }
  });

  $("#backToTags").bind("click", function (event, ui) {
    $.mobile.changePage("#tags", "slide", true, true, null, '#tags');
  });

  $("#backToTags").bind("tap", function (event, ui) {
    $.mobile.changePage("#tags", "slide", true, true, null, '#tags');
  });

  $("#backToAlbums").bind("click", function (event, ui) {
    $.mobile.changePage("#album", "slide", true, true, null, '#album');
  });

  $("#backToAlbums").bind("tap", function (event, ui) {
    $.mobile.changePage("#album", "slide", true, true, null, '#album');
  });
  
  $("#locations").bind("pagebeforeshow", function (event, ui) {
    initialize(); 
  });

  $("#player").bind("pagebeforeshow", function (event, ui) {
    var trackArray = [];
    //console.log(trackArray);
    $.getJSON('js/c.php?e=' + tracksToPlay + '&t=api&m=url', function (data) {
      //console.log(data);
      if (data.album_id) {
      
        //console.log('sweet we have an album');
        $.getJSON('js/c.php?e=' + data.album_id + '&t=api&m=album', function (albumData) {
          console.log(albumData);
          var player = $('#player h1');
          console.log(player);
          $(player).empty();
          $(player).append('<a style="color:white" href="'+albumData.url+'" >'+albumData.title+'</a>')          
          $.each(albumData.tracks, function (i, track) {
            //console.log(track);
            var t = {};
            t.name = track.title, t.mp3 = track.streaming_url;
            trackArray.push(t);
            if (i == albumData.tracks.length - 1) {
              initPlayer(trackArray);
            }
          });
          $('#jp-photo').append('<a href="'+albumData.url+'" ><img style="max-width:80px;"src="'+albumData.small_art_url+' " /></a>');
        });
      } else {
        //console.log('sweet we have a track');
      }
      //split this up into its own function later
    });


  });
  $("#album").bind("pagebeforeshow", function (event, ui) {
    var album = $(this);
    $.mobile.showPageLoadingMsg();
    var content = album.find('.content');

    var albumList = $("#albumList");
    albumList.empty();


    albumList.listview();
    $('#albumsGhost').load("js/c.php?e=/tag/" + tagToGrab + "&t=s .results", function () {

      var t = $(this);
      var items = t.find('ul li');
      $.each(items, function (i, el) {
        var li = '<li><a href="#" slug="' + $(el).find('a').attr('href') + '"><img src="' + $(el).find('.art').attr('src') + '" /><h3>' + $(el).find('.itemtext').text() + '</h3><p>' + $(el).find('.itemsubtext').text() + '</p></a></li>';

        albumList.append(li);

        if (i == items.list - 1) {
          $.mobile.hidePageLoadingMsg();
        }
      });
      albumList.listview("refresh");

      var itemsToBind = albumList.find('li');
      $.each(itemsToBind, function (i, item) {
        $(item).bind("click", function () {
          var slug = $(item).find('a').attr('slug');
          tracksToPlay = slug;
          $.mobile.changePage("#player", "slide", false, true, null, '#player');
        });

        $(item).bind("tap", function () {
          var slug = $(item).find('a').attr('slug');
          tracksToPlay = slug;
          $.mobile.changePage("#player", "fade", false, true, null, '#player');
        });

      });
    });
  });
  if (!tagsListLoaded) {
    loadTags();
  };
});


function loadHome() {
  $('#homesGhost').load("js/c.php?e=/&t=s #rightcontent", function () {
    var t = $(this),
        homeList = $("ul.homeList"),
        topAlbums = t.find('.top-albums ol li'),
        bigArt = t.find('.big-art ul').first().find('li');
    homeList.listview();
    homeList.append('<li data-role="list-divider">top sellers of late</li>');
    $.each(topAlbums, function (i, li) {
      var spans = $(li).find('.caption span');
      var li = '<li><a href = "#" slug="' + $(spans[2]).find('a').attr('href') + '"><img src="' + $(li).find('.thumbthumb').attr('src') + '" /><h3>' + $(li).find('.tralbum-title').text() + '</h3><p>' + $(spans[2]).text() + '</p></a></li>';
      
      homeList.append(li);
    });
    console.log(homeList);
    var itemsToBind = homeList.find('li');
    $.each(itemsToBind, function (i, item) {
      $(item).bind("click", function () {
        var slug = $(item).find('a').attr('slug');
        tracksToPlay = slug;
        $.mobile.changePage("#player", "slide", false, true, null, '#player');
      });

      $(item).bind("tap", function () {
        var slug = $(item).find('a').attr('slug');
        tracksToPlay = slug;
        $.mobile.changePage("#player", "fade", false, true, null, '#player');
      });

    });
    //homeList.append('<li data-role="list-divider">music we love</li>');
    $.each(bigArt, function (k, el) {
      var li = '<li><a href="' + $(el).find('.caption > a').attr('href') + '"><img src="' + $(el).find('a > img').attr('src') + '" /><h3>' + $(el).find('.caption').text() + '</h3></a></li>';
      //$(homeList).append(li);
    });
    homeList.listview("refresh");
    t.empty();
  }); //end homeGhost load
  home = true;
};

function loadTags() {
  $('#tagsGhost').load("js/c.php?e=/tags/&t=s #tags_cloud", function () {
    var t = $(this),
        tags = t.find('.tagcloud');
    tagAnchors = $(tags).find('a');
    $.each(tagAnchors, function (k, a) {
      var li = '<li><a href="#">' + $(a).text() + '</a></li>';
      tagsArr.push(li);

      if (k == tagAnchors.length - 1) {
        loadTagList();
        tagsLoaded = true;
      }
    });
    t.empty();
  });
};

function loadTagList() {

  $.each(tagsArr, function (k, a) {
    $(tagList).append(a);
    if (k == tagsArr.lenth - 1) {
      tagList.listview();
      tagList.listview("refresh");
    }
  });

  var tA = $(tagList).find('a');

  $.each(tA, function (k, anc) {
    var tagTxt = $(anc).text();

    $(anc).bind("click", function () {
      tagToGrab = tagTxt;
      $.mobile.changePage("#album", "slide", false, true, null, '#album');
    });

    $(anc).bind("tap", function () {
      tagToGrab = tagTxt;
      $.mobile.changePage("#album", "fade", false, true, null, '#album');

    });

  });
  tagsListLoaded = true;

}

function initPlayer(inc) {
  $('#player .content').empty();
  var html = '<div id="jquery_jplayer_2" class="jp-jplayer"></div><div class="jp-audio"><div class="jp-type-playlist"><div id="jp_interface_2" class="jp-interface"><div class="jp-controls" style="margin:5px 0 0 10px;"><span><a href="#" class="jp-previous" tabindex="1"><div></div></a></span><span><a href="#" class="jp-play" tabindex="1"><div></div></a></span><span><a href="#" class="jp-pause" tabindex="1"><div></div></a></span><span><a href="#" class="jp-next" tabindex="1"><div></div></a></span></div><span id="controlContainer"><div class="jp-progress"><div class="jp-seek-bar"><div class="jp-play-bar"></div></div></div><div class="jp-current-time"></div><div class="jp-duration"></div></span><div id="jp-photo"></div></div><div id="jp_playlist_2" class="jp-playlist"><ul><!--The method Playlist.displayPlaylist() uses this unordered list --><li></li></ul></div></div></div>';

  $('#player .content').append(html);
  var audioPlaylist = new Playlist("2", inc, {
    ended: function () {
      audioPlaylist.playlistNext();
    },
    play: function () {
      $(this).jPlayer("pauseOthers");
    },
    ready: function () {
      audioPlaylist.displayPlaylist();
      audioPlaylist.playlistInit(false); // Parameter is a boolean for autoplay.
    },
    swfPath: "js",
    supplied: "mp3"
  });
}

function initialize() {
console.log('init');
  var myLatlng = new google.maps.LatLng(35.782171,-0);
  var myOptions = {
    zoom: 1,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
}
var map = new google.maps.Map(document.getElementById("map"), myOptions);
console.log(map);
}