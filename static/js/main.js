
if (graph.length) {var in_graph = "FROM <"+graph+">"} else {var in_graph = ""}
const wd_img = ' <img src="https://upload.wikimedia.org/wikipedia/commons/d/d2/Wikidata-logo-without-paddings.svg" style="width:20px ; padding-bottom: 5px; filter: grayscale(100%);"/>'

 $(document).ready(function() {



    // loader
    $(".se-pre-con").fadeOut("slow");

  	// disable submit form when pressing return
  	$("input[type='text'], input[type='textarea']").on('keyup keypress', function(e) {
  	  var keyCode = e.keyCode || e.which;
  	  if (keyCode === 13) {
  	    e.preventDefault();
  	    return false;
  	  }
  	});

    // disable forms
    $(".disabled").attr("disabled","disabled");

  	// URL detection
    $('.info-url').each(function(element) {
       var str_text = $(this).html();
       var regex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
       // Replace plain text links by hyperlinks
       var replaced_text = str_text.replace(regex, "<a href='$1' target='_blank'>$1</a>");
       // Echo link
       $(this).html(replaced_text);
    });

  	// tooltips
  	$('.tip').tooltip();

    // fields without tooltip
    $('.input_or_select').not(':has(.tip)').css("padding-left","3.2em");
    // check prior records and alert if duplicate
    checkPriorRecords('disambiguate');

  	// Named Entity Recognition in long texts
  	// nlpText('add an id without hashtag');

  	// search WD and my data
  	$("input[type='text']").click(function () {
  		searchID = $(this).attr('id');

  		if ( $(this).hasClass('searchWikidata') ) {
  			searchWD(searchID);
  		};

  		if ( $(this).hasClass('searchGeneral') ) {
  			searchCatalogue('search');
  		};
  	});

  	// remove tag onclick
  	$(document).on('click', '.tag', function () {
  		$(this).next().remove();
  		$(this).remove();
  		colorForm();
  	});

  	// autoresize textarea
  	$('textarea').each(function () {
  		this.setAttribute('style', 'height:' + (this.scrollHeight)/2 + 'px;overflow-y:hidden;');
  	}).on('input', function () {
  		this.style.height = 'auto';
  		this.style.height = (this.scrollHeight) + 'px';
  	});

    // remove exceding whitespaces in text area
    $('textarea[id*="values__"]').each(function () {
      $(this).val($.trim($(this).val()).replace(/\s*[\r\n]+\s*/g, '\n'));
    });


  	// Show documentation in the right sidebar
  	if ($('header').hasClass('needDoc')) {
  		var menuRight = document.getElementById( 'cbp-spmenu-s2' ),
  		showRight = document.getElementById( 'showRight' ),
  		body = document.body;
  		showRight.onclick = function() {
  			classie.toggle( this, 'active' );
  			classie.toggle( menuRight, 'cbp-spmenu-open' );
  		};
  	};

    // hide lookup when creating a record
    $("#lookup").hide();
  	// append WD icon to input fields
  	$('.searchWikidata').parent().prev().append(wd_img);
    $('.wikiEntity').append(wd_img);
  	// hide placeholder if filled
  	//colorForm();

    // style mandatory fields
    $(".disambiguate").parent().prev(".label").append("<span class='mandatory'>*</span>")

  	// prevent POST when deleting records
  	$('.delete').click(function(e) {
  		var result = confirm("Are you sure you want to delete this record?");
  		if (result) { } else { e.preventDefault(); return false; };
  	});

    // change select aspect everywhere
    $('section > select').addClass('custom-select');

    // sort alphabetically in EXPLORE
    $('.list').each(function () {
        var letter = $('a', this).text().toUpperCase().charAt(0);
        if (!$(this).parent().find('[data-letter="'+ letter +'"]').length) {
          $(this).parent().append('<section data-letter="'+ letter+'" id="'+ letter+'" class="collapse toBeWrapped"></section>');
        	$(this).parent().parent().find($('.alphabet')).append('<span data-toggle="collapse" data-target="#'+ letter+'" aria-expanded="false" aria-controls="'+ letter+'" class="info_collapse" data-parent="#toc_resources">'+ letter +'</span>');
        };
        $(this).parent().find('[data-letter="'+ letter +'"]').append(this);
      });
    $('.toBeWrapped').wrapAll("<section class='accordion-group'></section>");

    // sort alphabet list
    if (document.getElementById("alphabet")) {sortList("alphabet");}

    // focus on click
    $('.resource_collapse').on('click', function (e) {
        $(e.currentTarget).parent('span').addClass('active');
    });

    // close other dropdowns when opening one
    var $myGroup = $('.accordion-group');
    $('.collapse').on('show.bs.collapse', function () {
        $('.resource_collapse').parent('span').removeClass('active');
        $('.info_collapse').removeClass('alphaActive');
        $myGroup.find('.collapse').collapse('hide');
        var id = $(this).attr('id');
        var dropLabel = $('.resource_collapse[data-target="#'+id+'"]');
        dropLabel.parent('span').addClass('active');
        // in browse by name the label of the tab is different
        var alphaLabel = $('.info_collapse[data-target="#'+id+'"]');
        alphaLabel.addClass('alphaActive');
    });

    // show more in EXPLORE
    $(".showMore").hide();

    // show related resources in "term" page
    $(".showRes").on("click", {count: $(".showRes").data("count"), uri: $(".showRes").data("uri"), limit_query: $(".showRes").data("limit"), offset_query: $(".showRes").data("offset")}, searchResources);

    // sortable blocks in template setup
    moveUpAndDown() ;

    // remove fields from form template
    $(".trash").click(function(e){
       e.preventDefault();
       $(this).parent().remove();
    });
});


////////////////
// ADD RECORD //
////////////////

function colorForm() {
	$('.searchWikidata').each( function() {
		if ($(this).next('span').length > 0) {
			$(this).removeAttr('placeholder');
			$(this).parent().prev('.label').css('color','lightgrey');
			$(this).parent().prev('.label').children('img').css('opacity','0.5');
			$(this).nextAll('span').css('color','lightgrey').css('border-color','lightgrey');

			$($(this).parent().parent()).hover(function(){
				$(this).children().addClass('color_hover');
				$(this).children().children('span').addClass('color_hover').addClass('bkg_hover');
			}, function() {
				$(this).children().removeClass('color_hover');
				$(this).children().children('span').removeClass('color_hover').removeClass('bkg_hover');
			});

		} else {
			$(this).parent().prev('.label').css('color','black');
			$(this).parent().prev('.label').children('img').css('opacity','1');
			$(this).nextAll('span').css('color','black').css('border-color','black');
		};
	});

	$('.freeText').each( function() {
		if ($(this).val().length > 0) {
			$(this).parent().prev('.label').css('color','lightgrey');
			$(this).parent().prev('.label').children('img').css('opacity','0.5');
			$(this).css('color','lightgrey');
			$($(this).parent().parent()).hover(function(){
				$(this).children().addClass('color_hover');
				$(this).children().children().addClass('color_hover');
				}, function() {
					$(this).children().removeClass('color_hover');
					$(this).children().children().removeClass('color_hover');
				});
		} else {
			$(this).parent().prev('.label').css('color','black');
			$(this).parent().prev('.label').children('img').css('opacity','1');
			$(this.value).css('color','black');
		};
	});
};

// delay a function
function throttle(f, delay){
    var timer = null;
    return function(){
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = window.setTimeout(function(){
            f.apply(context, args);
        },
        delay || 300);
    };
};

// search in wikidata and my catalogue
function searchWD(searchterm) {
	// wikidata autocomplete on keyup
	$('#'+searchterm).keyup(function(e) {
	  $("#searchresult").show();
	  var q = $('#'+searchterm).val();

	  $.getJSON("https://www.wikidata.org/w/api.php?callback=?", {
	      search: q,
	      action: "wbsearchentities",
	      language: "en",
	      uselang: "en",
	      format: "json",
	      strictlanguage: true,
	    },
	    function(data) {
	    	  // autocomplete positioning
	      	var position = $('#'+searchterm).position();
	      	var leftpos = position.left+15;
	      	var offset = $('#'+searchterm).offset();
    			var height = $('#'+searchterm).height();
    			var width = $('#'+searchterm).width();
    			var top = offset.top + height + "px";
    			var right = offset.left + width + "px";

    			$('#searchresult').css( {
    			    'position': 'absolute',
    			    'margin-left': leftpos+'px',
    			    'top': top,
    			    'z-index':1000,
    			    'background-color': 'white',
    			    'border':'solid 1px grey',
    			    'max-width':'600px',
    			    'border-radius': '4px'
    			});
    	    $("#searchresult").empty();

  	      // catalogue lookup in case nothing is found
  	      if(!data.search.length){
  	      	$("#searchresult").append("<div class='wditem noresults'>No matches in Wikidata...looking into the catalogue</div>");
  	      	// remove messages after 3 seconds
            console.log("here first");
      			setTimeout(function(){
      			  if ($('.noresults').length > 0) {
      			    $('.noresults').remove();
      			  }
      		  }, 3000);

      			var query = "prefix bds: <http://www.bigdata.com/rdf/search#> select distinct ?s ?o ?desc "+in_graph+" where { ?s rdfs:label ?o . OPTIONAL { ?s rdfs:comment ?desc} . ?o bds:search '"+q+"*' .}"
      			var encoded = encodeURIComponent(query)
            console.log("here");
      			$.ajax({
      				    type: 'GET',
      				    url: myPublicEndpoint+'?query=' + encoded,
      				    headers: { Accept: 'application/sparql-results+json'},
      				    success: function(returnedJson) {
      				    	// $("#searchresult").empty();
                    console.log(returnedJson);
                    // if (!returnedJson.length) {
        		      	// 			// $("#searchresult").empty();
        					  //   		$("#searchresult").append("<div class='wditem noresults'>No results in Wikidata and catalogue</div>");
        		      	// 			// remove messages after 3 seconds
        						// 		  setTimeout(function(){ if ($('.noresults').length > 0) { $('.noresults').remove(); } }, 3000);
        		      	// };

        						for (i = 0; i < returnedJson.results.bindings.length; i++) {
        							var myUrl = returnedJson.results.bindings[i].s.value;
        							// exclude named graphs from results
        							if ( myUrl.substring(myUrl.length-1) != "/") {
                        var resID = myUrl.substr(myUrl.lastIndexOf('/') + 1)
                        if (returnedJson.results.bindings[i].desc !== undefined) {var desc = '- '+returnedJson.results.bindings[i].desc.value} else {var desc = ''}
        								$("#searchresult").append("<div class='wditem'><a class='blue orangeText' target='_blank' href='view-"+resID+"'><i class='fas fa-external-link-alt'></i></a> <a class='orangeText' data-id=" + returnedJson.results.bindings[i].s.value + "'>" + returnedJson.results.bindings[i].o.value + "</a> " + desc + "</div>");
        							    };
        							};

          						// add tag if the user chooses an item from the catalogue
          						$('a[data-id^="'+base+'"]').each( function() {
          					        $(this).bind('click', function(e) {
          					        	e.preventDefault();
          					        	var oldID = this.getAttribute('data-id').substr(this.getAttribute('data-id').lastIndexOf('/') + 1);
          					        	var oldLabel = $(this).text();
          					        	$('#'+searchterm).after("<span class='tag "+oldID+"' data-input='"+searchterm+"' data-id='"+oldID+"'>"+oldLabel+"</span><input type='hidden' class='hiddenInput "+oldID+"' name='"+searchterm+"-"+oldID+"' value='"+oldID+","+encodeURIComponent(oldLabel)+"'/>");
          					        	$("#searchresult").hide();
          					        	$('#'+searchterm).val('');
          					        });

          					    });

      				    }
      			});
      			// end my catalogue
          };

  	      // fill the dropdown
  	      $.each(data.search, function(i, item) {
  	        $("#searchresult").append("<div class='wditem'><a class='blue' target='_blank' href='http://www.wikidata.org/entity/"+item.title+"'>"+wd_img+"</a> <a class='blue' data-id='" + item.title + "'>" + item.label + "</a> - " + item.description + "</div>");

            // add tag if the user chooses an item from wd
  	      	$('a[data-id="'+ item.title+'"]').each( function() {
  		        $(this).bind('click', function(e) {
  		        	e.preventDefault();
  		        	$('#'+searchterm).after("<span class='tag "+item.title+"' data-input='"+searchterm+"' data-id='"+item.title+"'>"+item.label+"</span><input type='hidden' class='hiddenInput "+item.title+"' name='"+searchterm+"-"+item.title+"' value='"+item.title+","+encodeURIComponent(item.label)+"'/>");
  		        	$("#searchresult").hide();
  		        	$('#'+searchterm).val('');
  		        	//colorForm();
  		        });

  		    });
	      });
	  	}
	  );
	});

	// if the user presses enter - create a new entity
	$('#'+searchterm).keypress(function(e) {
	    if(e.which == 13) {
	    	e.preventDefault();
	    	var now = new Date().valueOf();
  			var newID = 'MD'+now;
  			if (!$('#'+searchterm).val() == '') {
  				$('#'+searchterm).after("<span class='tag "+newID+"' data-input='"+searchterm+"' data-id='"+newID+"'>"+$('#'+searchterm).val()+"</span><input type='hidden' class='hiddenInput "+newID+"' name='"+searchterm+"-"+newID+"' value='"+newID+","+encodeURIComponent($('#'+searchterm).val())+"'/>");
  			};
  			$("#searchresult").hide();
  	    	$('#'+searchterm).val('');
  	    	//colorForm();
	    };
	});
};

// search bar menu
function searchCatalogue(searchterm) {
  $('#'+searchterm).keyup(function(e) {
    $("#searchresultmenu").show();
    var q = $('#'+searchterm).val();
    var query = "prefix bds: <http://www.bigdata.com/rdf/search#> select distinct ?s ?o ?desc "+in_graph+" where { ?o bds:search '"+q+"*'. ?s rdfs:label ?o ; a ?class .}"
    var encoded = encodeURIComponent(query)
    if (q == '') { $("#searchresultmenu").hide();}
    $.ajax({
          type: 'GET',
          url: myPublicEndpoint+'?query=' + encoded,
          headers: { Accept: 'application/sparql-results+json'},
          success: function(returnedJson) {
            $("#searchresultmenu").empty();
            // autocomplete positioning
  	      	var position = $('#'+searchterm).position();
  	      	var leftpos = position.left;
  	      	var offset = $('#'+searchterm).offset();
      			var height = $('#'+searchterm).height();
      			var width = $('#'+searchterm).width();
      			var top = offset.top + height + 14 + "px";
      			var right = offset.left + "px";

      			$('#searchresultmenu').css( {
      			    'position': 'absolute',
      			    'margin-right': leftpos+'px',
      			    'top': top,
                'left': right,
      			    'z-index':1000,
      			    'background-color': 'white',
      			    'border':'solid 1px grey',
      			    'max-width':'600px',
      			    'border-radius': '4px'
      			});
      	    $("#searchresultmenu").empty();

            if (!returnedJson.length) {
                  $("#searchresultmenu").empty();
                  var nores = "<div class='wditem noresults'>Searching...</div>";
                  $("#searchresultmenu").append(nores);
                  // remove messages after 1 second
                  setTimeout(function(){
                    if ($('.noresults').length > 0) {
                      $('.noresults').remove();
                      }
                    }, 1000);
            };

            for (i = 0; i < returnedJson.results.bindings.length; i++) {
              var myUrl = returnedJson.results.bindings[i].s.value;
              // exclude named graphs from results
              if ( myUrl.substring(myUrl.length-1) != "/") {
                var resID = myUrl.substr(myUrl.lastIndexOf('/') + 1)
                $("#searchresultmenu").append("<div class='wditem'><a class='blue orangeText' target='_blank' href='view-"+resID+"'><i class='fas fa-external-link-alt'></i> " + returnedJson.results.bindings[i].o.value + "</a></div>");
                  };
              };

          }
    });
  });
}

// NLP
function nlpText(searchterm) {
	$('textarea#'+searchterm).keypress( throttle(function(e) {
	  	if(e.which == 13) {
	  		//$('textarea#'+searchterm).parent().parent().append('<div class="tags-nlp col-md-9"></div>');
			$(this).next('.tags-nlp').empty();
			var textNLP = $('#'+searchterm).val();
			var encoded = encodeURIComponent(textNLP)

			// compromise.js
			var doc = nlp(textNLP);
			var listTopics = doc.nouns().toPlural().topics().out('topk');
			for (var i = 0; i < listTopics.length; i++) {
				// query WD for reconciliation
				$.getJSON("https://www.wikidata.org/w/api.php?callback=?", {
			      search: listTopics[i].normal,
			      action: "wbsearchentities",
			      language: "en",
			      limit: 1,
			      uselang: "en",
			      format: "json",
			      strictlanguage: true,
			    },
			    function(data) {
			    	$.each(data.search, function(i, item) {
				        $('textarea#'+searchterm).next('.tags-nlp').append('<span class="tag nlp '+item.title+'" data-input="'+searchterm+'" data-id="'+item.title+'">'+item.label+'</span><input type="hidden" class="hiddenInput '+item.title+'" name="'+searchterm+'-'+item.title+'" value="'+item.title+','+encodeURIComponent(item.label)+'"/>');
			    	});
			    });
			};


			// DBpedia spotlight
			$.ajax({
			    type: 'GET',
			    url: 'https://api.dbpedia-spotlight.org/en/annotate?text=' + encoded,
			    headers: { Accept: 'application/json' },
			    success: function(returnedJson) {
			    	var resources = returnedJson.Resources ;
			    	var result = new Array();
			    	for (var i = 0; i < resources.length; i++) {
			    		var uri = resources[i]['@URI'] ;
			    		// remove duplicates retrieved by DBpedia spotlight
				    	if(result.indexOf(uri) == -1){
				            result.push(uri);
				            // look for samAs in Dbpedia LDF to Wikidata
				            $.ajax({
							    type: 'GET',
							    url: 'http://data.linkeddatafragments.org/dbpedia',
							    data: {subject: uri, predicate: 'http://www.w3.org/2002/07/owl#sameAs', object: ""},
							    headers: { Accept: 'application/n-triples; charset=utf-8' },
							    success: function(data) {
							    	var myRegexp = /<http:\/\/www.w3.org\/2002\/07\/owl#sameAs> <http:\/\/wikidata.org\/entity\/(.*)>/;
									var match = myRegexp.exec(data);
									var res = match[1];
									if (res && !$('textarea#'+searchterm).parent().next('.tags-nlp').children("span[data-id="+match[1]+"]").length ) {
										// get Wikidata label
										$.ajax({
											url: "https://cors-anywhere.herokuapp.com/https://www.wikidata.org/w/api.php?action=wbgetentities&ids="+res+'&props=labels&languages=en&languagefallback=en&sitefilter=&formatversion=2&format=json',
											success: function(data) {
												$('textarea#'+searchterm).parent().next('.tags-nlp').append('<span class="tag nlp '+res+'" data-input="'+searchterm+'" data-id="'+res+'">'+data.entities[res].labels.en.value+'</span><input type="hidden" class="hiddenInput '+res+'" name="'+searchterm+'-'+res+'" value="'+res+','+encodeURIComponent(data.entities[res].labels.en.value)+'"/>');


											}
										});
									} else {
										// try to match dbpedia > wikipedia > wikidata entities
							    		var WikiPage = 'https://en.wikipedia.org/wiki/'+ uri.substr(uri.lastIndexOf('/') + 1);
							    		$.ajax({
										    type: 'GET',
										    url: 'https://query.wikidata.org/bigdata/ldf',
										    data: {subject: WikiPage, predicate: 'http://schema.org/about', object: ""},
										    headers: { Accept: 'application/n-triples; charset=utf-8' },
										    success: function(data) {
										    	// get the object URI
												var myRegexp = /<http:\/\/www.wikidata.org\/entity\/(.*)>/;
												var match = myRegexp.exec(data);
												var res = match[0];
												// remove duplicates already found by compromise.js
												if (res && !$('textarea#'+searchterm).parent().next('.tags-nlp').children("span[data-id="+match[1]+"]").length ) {
													$.ajax({
													    type: 'GET',
													    url: 'https://query.wikidata.org/bigdata/ldf',
													    data: {subject: res, predicate: 'http://www.w3.org/2000/01/rdf-schema#label', object: ""},
													    headers: { Accept: 'application/n-triples; charset=utf-8' },
													    success: function(dataLabel) {
													    	// get the object label
													    	var myRegexpLabel = /"(.*)"@en/;
													    	var matchLabel = myRegexpLabel.exec(dataLabel);
													    	var label = matchLabel[1];
													    	$('textarea#'+searchterm).parent().next('.tags-nlp').append('<span class="tag nlp '+match[1]+'" data-input="'+searchterm+'" data-id="'+match[1]+'">'+label+'</span><input type="hidden" class="hiddenInput '+match[1]+'" name="'+searchterm+'-'+match[1]+'" value="'+match[1]+','+encodeURIComponent(label)+'"/>');
													    }
													});
												};
										    }
										});

									};
							    }
							});




				        };
				    };
			    }
		    });
		};

	}) );
};

// lookup when creating new records
function checkPriorRecords(elem) {
  $('.'+elem).keyup(function(e) {
	  $("#lookup").show();
	  var q = $('.'+elem).val();
    var classes = $(this).attr('class');
    var expression =  /\(([^)]+)\)/i;
    var regex = new RegExp(expression);
    if (classes.match(regex)) {
      var res_class = ' a <'+classes.match(regex)[1]+'> ; ';
    } else {var res_class = ''};
    var query = "prefix bds: <http://www.bigdata.com/rdf/search#> select distinct ?s ?o "+in_graph+" where { ?s "+res_class+" rdfs:label ?o . ?o bds:search '"+q+"' .} LIMIT 5"
    var encoded = encodeURIComponent(query);

    $.ajax({
  	    type: 'GET',
  	    url: myPublicEndpoint+'?query=' + encoded,
  	    headers: { Accept: 'application/sparql-results+json'},
  	    success: function(returnedJson) {
  	    	$("#lookup").empty();
  			  if (!returnedJson.results.bindings.length) {
          //$("#lookup").append("<h3>We found the following resources that are similar to the one you mention.</h3>")
    			} else {
            $("#lookup").append("<div>We already have some resources that match with yours. If this is the case, consider suggesting a different resource!</div>")
            for (i = 0; i < returnedJson.results.bindings.length; i++) {
                // exclude named graphs from results
                var myUrl = returnedJson.results.bindings[i].s.value;
                if ( myUrl.substring(myUrl.length-1) != "/") {
                  var resID = myUrl.substr(myUrl.lastIndexOf('/') + 1)
                  $("#lookup").append("<div class='wditem'><a class='blue orangeText' target='_blank' href='view-"+resID+"'><i class='fas fa-external-link-alt'></i></a> <a class='orangeText' data-id=" + returnedJson.results.bindings[i].s.value + "'>" + returnedJson.results.bindings[i].o.value + "</a></div>");
                };
            };
            $("#lookup").append("<span id='close_section' class='btn btn-dark'>Ok got it!</span>")
            // close lookup suggestions
            $('#close_section').on('click', function() {
              var target = $(this).parent();
              target.hide();
            });
    			};
  	    }
  	});

  });
};

///////////////
// TERM PAGE //
///////////////

// search catalogue resources on click and offset
function searchResources(event) {
  var uri = event.data.uri;
  var count = event.data.count;
  var offset_query = event.data.offset_query;
  var limit_query = event.data.limit_query;

  if (offset_query == "0") {
    var query = "select distinct ?o ?label "+in_graph+" where { ?o ?p <"+uri+"> ; rdfs:label ?label . } ORDER BY ?o LIMIT "+limit_query+" "
  } else {
    var query = "select distinct ?o ?label "+in_graph+" where { ?o ?p <"+uri+"> ; rdfs:label ?label . } ORDER BY ?o OFFSET "+offset_query+" LIMIT "+limit_query+" "
  }
  var encoded = encodeURIComponent(query)
  $.ajax({
        type: 'GET',
        url: myPublicEndpoint+'?query=' + encoded,
        headers: { Accept: 'application/sparql-results+json'},
        success: function(returnedJson) {
          if (!returnedJson.results.bindings.length) {
            $(".relatedResources").append("<div class='wditem noresults'>No more resources</div>");
          } else {
            for (i = 0; i < returnedJson.results.bindings.length; i++) {
              var myUrl = returnedJson.results.bindings[i].o.value;
              // exclude named graphs from results
              if ( myUrl.substring(myUrl.length-1) != "/") {
                var resID = myUrl.substr(myUrl.lastIndexOf('/') + 1)
                var newItem = $("<div id='"+resID+"' class='wditem'><a class='blue orangeText' target='_blank' href='view-"+resID+"'><i class='fas fa-external-link-alt'></i></a> <span class='orangeText' data-id=" + returnedJson.results.bindings[i].o.value + "'>" + returnedJson.results.bindings[i].label.value + "</span></div>").hide();
                $(".relatedResources").prepend(newItem);
                newItem.show('slow');
                };
              };
          };
        }
  });
  // update offset query
  var offset_query = offset_query+limit_query ;
  $(".showRes").html("show more");
  event.data.offset_query = offset_query;
  if (event.data.offset_query > count) {
    $(".showRes").hide();
    //$(".hideRes").show();
  }
};


//////////////
// EXPLORE //
//////////////

// sort alphabetically
function sortList(ul) {
  var ul = document.getElementById(ul);

  Array.from(ul.getElementsByTagName("span"))
    .sort((a, b) => a.textContent.localeCompare(b.textContent))
    .forEach(span => ul.appendChild(span));
};


// get values by property in EXPLORE page, e.g. creators
function getPropertyValue(elemID, prop, typeProp, typeField) {
  // TODO extend for vocabulary terms
  if (typeProp == 'URI' && (typeField == 'Textbox' || typeField == 'Dropdown'|| typeField == 'Checkbox') ) {
    var query = "select distinct ?o ?oLabel (COUNT(?s) AS ?count) "+in_graph+" where { GRAPH ?g { ?s <"+prop+"> ?o. ?o rdfs:label ?oLabel . } ?g <"+base+"publicationStage> ?stage . FILTER( str(?stage) != 'not modified' ) } GROUP BY ?o ?oLabel ORDER BY DESC(?count) lcase(?oLabel)";
  } else {var query = "none"};

  const len = 10;
  var encoded = encodeURIComponent(query);
  $.ajax({
        type: 'GET',
        url: myPublicEndpoint+'?query=' + encoded,
        headers: { Accept: 'application/sparql-results+json'},
        success: function(returnedJson) {
          var allresults = [];
          var results = [];
          for (i = 0; i < returnedJson.results.bindings.length; i++) {
            var res = returnedJson.results.bindings[i].o.value;
            var resLabel = returnedJson.results.bindings[i].oLabel.value;
            var count = returnedJson.results.bindings[i].count.value;
            var result = "<button onclick=getRecordsByPropValue(this,'."+elemID+"results') id='"+res+"' class='queryGroup' data-property='"+prop+"' data-value='"+res+"' data-toggle='collapse' data-target='#"+elemID+"results' aria-expanded='false' aria-controls='"+elemID+"results' class='info_collapse'>"+resLabel+" ("+count+")</button>";
            if (allresults.indexOf(result) === -1) {
              allresults.push(result);
              results.push($(result).hide());
              $("#"+elemID).append($(result).hide());
            };


          };

          // show more in EXPLORE
          if (results.length > len) {
            // show first batch
            $("#"+elemID).find("button:lt("+len+")").show('smooth');
            $("#"+elemID).next(".showMore").show();

            // show more based on var len
            let counter = 1;
            $("#"+elemID).next(".showMore").on("click", function() {
              ++counter;
              var offset = counter*len;
              var limit = offset+len;
              console.log(counter, offset, limit);
              $("#"+elemID).find("button:lt("+limit+")").show('smooth');
            });

          } else if (results.length > 0 && results.length <= len) {
            $("#"+elemID).find("button:not(.showMore)").show('smooth');
          };

        } // end function

  });

};

// get records by value and property in EXPLORE
function getRecordsByPropValue(el, resElem) {
  $(el).toggleClass("alphaActive");
  if ($(resElem).length) {$(resElem).empty();}
  var prop = $(el).data("property");
  var val = $(el).data("value");
  var query = "select distinct ?s ?sLabel "+in_graph+" where { GRAPH ?g { ?s <"+prop+"> <"+val+">; rdfs:label ?sLabel . } ?g <"+base+"publicationStage> ?stage . FILTER( str(?stage) != 'not modified' ) } ORDER BY ?sLabel"
  var encoded = encodeURIComponent(query);
  $.ajax({
        type: 'GET',
        url: myPublicEndpoint+'?query=' + encoded,
        headers: { Accept: 'application/sparql-results+json'},
        success: function(returnedJson) {
          for (i = 0; i < returnedJson.results.bindings.length; i++) {
            var res = returnedJson.results.bindings[i].s.value;
            var resID = res.substr(res.lastIndexOf('/') + 1)
            var resLabel = returnedJson.results.bindings[i].sLabel.value;
            $(resElem).append("<section><a href='view-"+resID+"'>"+resLabel+"</a></section>");
          };
        }
  });
};


//////////////
// TEMPLATE //
//////////////

// update index of fields in template page (to store the final order)
function updateindex() {
  $('.sortable .block_field').each(function(){
    var idx = $(".block_field").index(this);
    $(this).attr( "data-index", idx );
    var everyChild = this.getElementsByTagName("*");
    for (var i = 0; i< everyChild.length; i++) {
      var childid = everyChild[i].id;
      var childname = everyChild[i].name;
      if (childid != undefined) {
        if (!isNaN(+childid.charAt(0))) { everyChild[i].id = idx+'__'+childid.split(/__(.+)/)[1]}
        else {everyChild[i].id = idx+'__'+childid;}
      };
      if (childname != undefined) {
        if (!isNaN(+childname.charAt(0))) { everyChild[i].name = idx+'__'+childname.split(/__(.+)/)[1]}
        else {everyChild[i].name = idx+'__'+childname;}
      };
    };
  });
};

// move blocks up/down when clicking on arrow
function moveUpAndDown() {
  var selected=0;
  var itemlist = $('.sortable');
  var nodes = $(itemlist).children();
  var len=$(itemlist).children().length;
  // initialize index
  updateindex();

  $(".sortable .block_field").click(function(){
      selected= $(this).index();
  });

  $(".up").click(function(e){
   e.preventDefault();
   if(selected>0) {
        jQuery($(itemlist).children().eq(selected-1)).before(jQuery($(itemlist).children().eq(selected)));
        selected=selected-1;
        updateindex();
      };

  });

  $(".down").click(function(e){
     e.preventDefault();
    if(selected < len) {
        jQuery($(itemlist).children().eq(selected+1)).after(jQuery($(itemlist).children().eq(selected)));
        selected=selected+1;
        updateindex();
      };
  });


};

// if field type is selected
function is_selected(st, field) {
  if (st == field) {return "selected='selected'"} else {return ""};
};

// add new field in template
function add_field(field, res_type) {
  console.log(field);
  var contents = "";
  var temp_id = Date.now().toString(); // to be replaced with label id before submitting

  var field_type = "<section class='row'>\
    <label class='col-md-3'>FIELD TYPE</label>\
    <select onchange='change_fields(this)' class='col-md-8 ("+res_type+") custom-select' id='type__"+temp_id+"' name='type__"+temp_id+"'>\
      <option value='None'>Select</option>\
      <option value='Textbox' "+is_selected('Textbox',field)+">Textbox (text values or name of entities)</option>\
      <option value='Dropdown' "+is_selected('Dropdown',field)+">Dropdown (select one value from a list)</option>\
      <option value='Checkbox' "+is_selected('Checkbox',field)+">Checkbox (multiple choice)</option>\
    </select>\
  </section>";

  var field_name = "<section class='row'>\
    <label class='col-md-3'>DISPLAY NAME</label>\
    <input type='text' id='label__"+temp_id+"' class='col-md-8' name='label__"+temp_id+"'/>\
  </section>";

  var field_prepend = "<section class='row'>\
    <label class='col-md-3'>DESCRIPTION <br><span class='comment'>a short explanation of the expected value</span></label>\
    <textarea id='prepend__"+temp_id+"' class='col-md-8 align-self-start' name='prepend__"+temp_id+"'></textarea>\
  </section>";

  var field_property = "<section class='row'>\
    <label class='col-md-3'>RDF PROPERTY</label>\
    <input type='text' id='property__"+temp_id+"' class='col-md-8' name='property__"+temp_id+"'/>\
  </section>";

  var field_value = "<section class='row'>\
    <label class='col-md-3'>VALUE TYPE</label>\
    <select class='col-md-8 ("+res_type+") custom-select' id='value__"+temp_id+"' name='value__"+temp_id+"' onchange='add_disambiguate("+temp_id+",this)'>\
      <option value='None'>Select</option>\
      <option value='Literal'>Free text (Literal)</option>\
      <option value='URI'>Entity (URI from Wikidata or catalogue)</option>\
    </select>\
  </section>";

  var field_placeholder = "<section class='row'>\
    <label class='col-md-3'>PLACEHOLDER <br><span class='comment'>an example value to be shown to the user (optional)</span></label>\
    <input type='text' id='placeholder__"+temp_id+"' class='col-md-8 align-self-start' name='placeholder__"+temp_id+"'/>\
  </section>";

  var field_values = "<section class='row'>\
    <label class='col-md-3'>VALUES <br><span class='comment'>write one value per row in the form uri, label</span></label>\
    <textarea id='values__"+temp_id+"' class='col-md-8 values_area align-self-start' name='values__"+temp_id+"'></textarea>\
  </section>";

  var field_browse = "<section class='row'>\
    <label class='col-md-11 col-sm-6' for='browse__"+temp_id+"'>use this value as a filter in <em>Explore</em> page</label>\
    <input type='checkbox' id='browse__"+temp_id+"' name='browse__"+temp_id+"'>\
  </section>"

  var open_addons = "<section id='addons__"+temp_id+"'>";
  var close_addons = "</section>";
  var up_down = '<a href="#" class="up"><i class="fas fa-arrow-up"></i></a> <a href="#" class="down"><i class="fas fa-arrow-down"></i></a><a href="#" class="trash"><i class="far fa-trash-alt"></i></a>';

  contents += field_type + field_name + field_prepend + field_property + open_addons;
  if (field =='Textbox') { contents += field_value + field_placeholder; }
  else {contents += field_values + field_browse; };
  contents += close_addons + up_down;
  $(".sortable").append("<section class='block_field'>"+contents+"</section>");
  updateindex();
  moveUpAndDown() ;
  $(".trash").click(function(e){
     e.preventDefault();
     $(this).parent().remove();
  });
};

// if value == literal add disambiguate checkbox
function add_disambiguate(temp_id, el) {
  var field_disambiguate = "<section class='row'>\
    <label class='left col-md-11 col-sm-6' for='disambiguate__"+temp_id+"'>use this value as primary label (e.g. book title)</label>\
    <input class='disambiguate' onClick='disable_other_cb(this)' type='checkbox' id='disambiguate__"+temp_id+"' name='disambiguate__"+temp_id+"'>\
    </section>";

  var field_browse = "<section class='row'>\
    <label class='col-md-11 col-sm-6' for='browse__"+temp_id+"'>use this value as a filter in <em>Explore</em> page</label>\
    <input type='checkbox' id='browse__"+temp_id+"' name='browse__"+temp_id+"'>\
  </section>";

  if (el.value == 'Literal') {
      $("input[id*='browse__"+temp_id+"']").parent().remove();
      $(el).parent().parent().append(field_disambiguate);
      updateindex();
      moveUpAndDown() ;
  } else if (el.value == 'URI') {
    console.log("here");
    if ($("input[id*='disambiguate__"+temp_id+"']") != undefined) {
      console.log("here");
      //$("input[id*='disambiguate__"+temp_id+"']").parent().after(field_browse);
      $("section[id*='addons__"+temp_id+"']").after(field_browse);
      $("input[id*='disambiguate__"+temp_id+"']").parent().remove();
    } else {

      $("section[id*='addons__"+temp_id+"']").after(field_browse);
    }
    updateindex();
    moveUpAndDown() ;
  }
};

// if one disambiguate is checked, disable others
function disable_other_cb(ckType) {
  var ckName = document.getElementsByClassName('disambiguate');
  var checked = document.getElementById(ckType.id);

    if (checked.checked) {
      for(var i=0; i < ckName.length; i++){
          ckName[i].checked = false;
          // if(!ckName[i].checked){ ckName[i].disabled = true; }
          // else{ ckName[i].disabled = false;}
      }
      checked.checked = true;
    }
    else {
      for(var i=0; i < ckName.length; i++){
        ckName[i].disabled = false;
      }
    }
};

// when changing field type, change the form
function change_fields(sel) {
  var new_field_type = sel.value;
  var block_field = $(sel).parent().parent();

  var idx = sel.id;
  var temp_id = idx.substr(idx.lastIndexOf("__")).replace('__', '');

  var regExp = /\(([^)]+)\)/;
  var matches = regExp.exec(sel.classList.value);
  var res_type = matches[1];

  var field_value = "<section class='row'>\
    <label class='col-md-3'>VALUE TYPE</label>\
    <select class='col-md-8 ("+res_type+") custom-select' id='value__"+temp_id+"' name='value__"+temp_id+"' onchange='add_disambiguate("+temp_id+",this)'>\
      <option value='None'>Select</option>\
      <option value='Literal'>Free text (Literal)</option>\
      <option value='URI'>Entity (URI from Wikidata or catalogue)</option>\
    </select>\
  </section>";

  var field_placeholder = "<section class='row'>\
    <label class='col-md-3'>PLACEHOLDER <br><span class='comment'>an example value to be shown to the user (optional)</span></label>\
    <input type='text' id='placeholder__"+temp_id+"' class='col-md-8 align-self-start' name='placeholder__"+temp_id+"'/>\
  </section>";

  var field_values = "<section class='row'>\
    <label class='col-md-3'>VALUES <br><span class='comment'>write one value per row in the form uri, label</span></label>\
    <textarea id='values__"+temp_id+"' class='col-md-8 values_area align-self-start' name='values__"+temp_id+"'></textarea>\
  </section>";

  if (new_field_type == 'Textbox') {
    if (block_field.find('.row > textarea[id*="values__"]').length) {
      block_field.find('.row > textarea[id*="values__"]').parent().after(field_value+field_placeholder);
      block_field.find('.row > textarea[id*="values__"]').parent().detach();
    }
    updateindex();
    moveUpAndDown() ;
  }
  if (new_field_type == 'Dropdown' || new_field_type == 'Checkbox'){
    if (block_field.find('.row > select[id*="value__"]').length) {
      block_field.find('.row > select[id*="value__"]').parent().after(field_values);
      block_field.find('.row > select[id*="value__"]').parent().detach();
      if (block_field.find('.row > input[id*="disambiguate__"]').length) {
        block_field.find('.row > input[id*="disambiguate__"]').parent().detach();
      }
      if (block_field.find('.row > input[id*="placeholder__"]').length) {
        block_field.find('.row > input[id*="placeholder__"]').parent().detach();
      }
      updateindex();
      moveUpAndDown() ;
    }
  }
};
