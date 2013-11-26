/*
* jQuery Newsviewer 1.0 by Francesco De Stefano © 2013
* http://ulmdevice.altervista.org/jq_news_viewer/
*/

(function($) {
   $.fn.newsviewer = function(options) {
      return this.each(function() {   
         $.newsviewer(this, options);
      });
   };

   $.newsviewer = function(obj, options) {
      var settings = {
         mode: 'default', 
         dataSource: 'local',
         param: null,
         access_token: null,
         url: null,
         maxItems: 10,
         pause: 5000,
         speed: 50,
         target: '_self',
         includeDate: true,
         numPerPage: 1
      };

      if (options)
         settings = $.extend(settings, options);

      $obj = $(obj);
      $obj.empty();      

      if (settings.mode == 'scroller') {
         $('<p></p>').css('position', 'relative').appendTo($obj);
      }

      $container = $obj;

      if (settings.mode == 'scroller'){
         $container = $('p', $obj);
      }

      if (settings.dataSource == 'local') {
         if (settings.param != null) {
            for (var i=0; i<settings.param.length; i++) {
               AddHeadline($container, settings.param[i][0], settings.param[i][1], settings.param[i][2], settings.param[i][3], settings.includeDate, settings.target);
            }
         }
         SetupViewer($obj, settings);
      }
      else if (settings.dataSource == 'rss') {
         var $loadingIndicator = $('<img/>')
           .attr({
           'src': 'newsviewer.gif', 
           'alt': 'Loading. Please wait.'
         })
         .addClass('news-wait')
         .appendTo($obj);

         $.get(settings.url, function(data) {
            $loadingIndicator.remove();

            $('rss item', data).each(function(index, value) {
               if (index >= settings.maxItems) 
                  return false;

               AddHeadline($container, $('link', this).text(), $('title', this).text(), $('pubDate', this).text(), $('description', this).text(), settings.includeDate, settings.target);
            });
            SetupViewer($obj, settings);
        });
      }
      else if (settings.dataSource == 'twitter') {
         var $loadingIndicator = $('<img/>')
           .attr({
           'src': 'newsviewer.gif', 
           'alt': 'Loading. Please wait.'
         })
         .addClass('news-wait')
         .appendTo($obj);

         var url = "http://api.getmytweets.co.uk/?screenname=";
         url += settings.param;
	 	url += "&limit=";
         url += settings.maxItems;

         $.getJSON(url, function(data) {
            $loadingIndicator.remove();
            $.each(data.tweets, function(index, tweet) {   
               var $link = $('<a></a>')
               .attr('href', 'https://twitter.com/' + settings.param)
               .attr('target', settings.target)
               .text(tweet.response.substring(0, 25) + "...");

               var $headline = $('<h4></h4>').append($link);
               var $publication;
 
               if (settings.includeDate) {
                  $publication = $('<div></div>')
                     .addClass('publication-date')
                     .text(tweet.tweet_date);
               }
               else {
                  $publication = $('<div></div>');
               }

               var $summary = $('<div></div>')
               .addClass('summary')
               .text(tweet.response);
        
               $('<div></div>')
               .addClass('headline')
               .append($headline, $publication, $summary)
               .appendTo($container);

               $('<br>').appendTo($container);
            }); 
            SetupViewer($obj, settings);  
         });
      }
      else if (settings.dataSource == 'facebook') {
         var $loadingIndicator = $('<img/>')
           .attr({
           'src': 'newsviewer.gif', 
           'alt': 'Loading. Please wait.'
         })
         .addClass('news-wait')
         .appendTo($obj);

         var url = 'https://graph.facebook.com/'+settings.param+'/posts/?access_token='+settings.access_token+'&callback=?&date_format=U&limit=';
         url += settings.maxItems;

         $.getJSON(url, function(data) {
            $loadingIndicator.remove();
            $.each(data.data, function(index, post) {   
               var $linkpage = $('<a></a>')
               .attr('href', 'http://www.facebook.com/' + settings.param)
               .attr('target', settings.target)
               .text(post.message.substring(0, 25) + "...");
				var $picture = $('<img />')
					.attr('src', post.picture);
								
				var $link = $('<a></a>')
               		.attr('href', post.link)
               		.attr('target', settings.target)
               		.text(post.description); 
					
               var $headline = $('<h4></h4>').append($linkpage);
               var $extlink = $('<p></p>').append($link);
               var $publication;
 				
               if (settings.includeDate) {
                  $publication = $('<div></div>')
                     .addClass('publication-date')
                     .text(relativeTime(post.created_time * 1000));
               }
               else {
                  $publication = $('<div></div>');
               }

               var $summary = $('<div></div>')
               .addClass('summary')
               .text(post.message);
        		
               $('<div></div>')
               .addClass('headline')
               .append($headline, $extlink, $picture, $publication, $summary)
               .appendTo($container);

               $('<br>').appendTo($container);
            }); 
            SetupViewer($obj, settings);  
         });
      }
      else if (settings.dataSource == 'flickr') {
         var $loadingIndicator = $('<img/>')
           .attr({
           'src': 'newsviewer.gif', 
           'alt': 'Loading. Please wait.'
         })
         .addClass('news-wait')
         .appendTo($obj);

         var url = 'http://api.flickr.com/services/feeds/photos_public.gne?id=' + settings.param + '&format=json';

         if (settings.param != null) {
            url += "&";
         }

         url += "jsoncallback=?";

         $.getJSON(url, function(data) {
            $loadingIndicator.remove();

            $.each(data.items, function(index, item) {
               var $link = $('<a></a>')
               .attr('href', item.link)
               .attr('target', settings.target)
               .text(item.title);

               var $headline = $('<h4></h4>').append($link);
               var $author = $('<div></div>')
                     .addClass('publication-date')
                     .text(item.author.split("(")[1].replace(")", ""));
    
               var $img = $('<img>').attr("src", item.media.m);
        		var $date = $('<p></p>').text(item.published)	
               $('<div></div>')
                  .addClass('headline')
                  .append($headline, $author, $img, $date)
                  .appendTo($container);

               $('<br>').appendTo($container);

               if (index == settings.maxItems) 
                  return false;
            });
            SetupViewer($obj, settings);  
         });
      }
   }

   function AddHeadline($obj, url, title, date, description, includeDate, target) {
      var $link = $('<a></a>')
         .attr('href', url)
         .attr('target', target)
         .html(title);
      var $headline = $('<h4></h4>').append($link);
      var $publication;

      if (includeDate) {
         var pubDate = new Date(date);
	   var pubDay = pubDate.getDate();         
	   var pubMonth = pubDate.getMonth() + 1;          
         var pubYear = pubDate.getFullYear();

         if (!isNaN(pubMonth) && !isNaN(pubDay) && !isNaN(pubYear)) {
            $publication = $('<div></div>')
               .addClass('publication-date')
               .text(pubDay + '/' + pubMonth + '/' + pubYear);
         }
         else {
            $publication = $('<div></div>');
         }
      }
      else {
         $publication = $('<div></div>');
      }

      var $summary = $('<div></div>')
          .addClass('summary')
          .html(description);
        
      $('<div></div>')
          .addClass('headline')
          .append($headline, $publication, $summary)
          .appendTo($obj);

      $('<br>').appendTo($obj);
   }
  
   function SetupViewer($obj, settings) {
      if (settings.mode == 'default')
      {
         $obj.css('overflow-y', 'auto'); 

         $('.headline').css('position', 'relative');
         $('.headline').css('height', 'auto');
         $('.headline').css('top', '0');
      }
      else if (settings.mode == 'rotate') {
         var currentHeadline = 0, oldHeadline = 0;
         var hiddenPosition = $obj.height() + 10;
         $('div.headline').eq(currentHeadline).css('top', 0);
         var headlineCount = $('div.headline').length;
         var pause;
         var rotateInProgress = false;

         var headlineRotate = function() 
         {
            if (!rotateInProgress) 
            {
               rotateInProgress = true;
               pause = false;
               currentHeadline = (oldHeadline + 1) % headlineCount;
            
               $('div.headline').eq(oldHeadline).animate(
               {top: -hiddenPosition}, 'slow', function() {
                 $(this).css('top', hiddenPosition);
               });
          
               $('div.headline').eq(currentHeadline).animate(
               { top: 0}, 'slow', function() {
                  rotateInProgress = false;
                  if (!pause) 
                  {
                     pause = setTimeout(headlineRotate, settings.pause);
                  }
               });
               oldHeadline = currentHeadline;
            }
         };
         if (!pause) 
         {
            pause = setTimeout(headlineRotate, settings.pause);
         }
      
         $obj.hover(function() 
         {
            clearTimeout(pause);
            pause = false;
         }, function() 
         {
            if (!pause) 
            {
               pause = setTimeout(headlineRotate, 250);
            }
         });
      }
      else if (settings.mode == 'scroller') {
         $('.headline').css('position', 'relative');
         $('.headline').css('height', 'auto');
         $('.headline').css('top', '0');

         settings.ticker_height = $obj.height();
         settings.news_height = $container.height();
         settings.line_count = 0;
         settings.rotate = true;

         $obj.hover(function()
         {
            settings.rotate = false;
         },
         function()
         {
            settings.rotate = true;
         }
         );
         DoScroll($obj, settings);
      }
      else if (settings.mode == 'paginate')
      {
         $obj.css('overflow-y', 'auto'); 

         $('.headline').css('position', 'relative');
         $('.headline').css('height', 'auto');
         $('.headline').css('top', '0');

         var currentPage = 0;
         var repaginate = function() 
         {
           $obj.find('.headline').hide()
            .slice(currentPage * settings.numPerPage,
              (currentPage + 1) * settings.numPerPage)
            .show();
         };

         var numRows = $obj.find('.headline').length;
         var numPages = Math.ceil(numRows / settings.numPerPage);
         var $pager = $('<div class="pager"></div>');
         for (var page = 0; page < numPages; page++) 
         {
           $('<span class="page-number"></span>').text(page + 1)
             .bind('click', {newPage: page}, function(event) 
          {
             currentPage = event.data['newPage'];
             repaginate();
             $(this).addClass('active')
               .siblings().removeClass('active');
           }).appendTo($pager).addClass('clickable');
       }
       $pager.prependTo($obj).find('span.page-number:first').addClass('active');

       repaginate();
     }
   }

   function DoScroll($obj, settings) 
   {
      settings.line_count += settings.rotate ? -2 : 0;
      $('p', $obj).css('top', settings.line_count);

      if (settings.line_count<-1 * settings.news_height) {
         settings.line_count = settings.ticker_height;
      }
      setTimeout( function() { DoScroll($obj, settings) }, settings.speed);
   }
   function relativeTime(time){
		
		// Realizzato da James Herdman's http://bit.ly/e5Jnxe
		
		var period = new Date(time);
		var delta = new Date() - period;

		if (delta <= 10000) {	
			return 'Just now';
		}
		
		var units = null;
		
		var conversions = {
			millisecond: 1,		// ms -> ms
			second: 1000,		// ms -> sec
			minute: 60,			// sec -> min
			hour: 60,			// min -> hour
			day: 24,			// hour -> day
			month: 30,			// day -> month (roughly)
			year: 12			// month -> year
		};
		
		for (var key in conversions) {
			if (delta < conversions[key]) {
				break;
			}
			else {
				units = key;
				delta = delta / conversions[key];
			}
		}
		
		delta = Math.floor(delta);
		if (delta !== 1) { units += 's'; }
		return [delta, units, "ago"].join(' ');
		
	}

})(jQuery);
