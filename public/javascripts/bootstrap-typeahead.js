
!function( $ ){

  "use strict"


  var Typeahead = function ( element, options ) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead.defaults, options)

    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.$menu = $(this.options.menu).appendTo('body')
    this.source = this.options.source
    this.noMatchFoundText = this.options.noMatchFoundText
    this.useNoMatchFound = !!this.noMatchFoundText 
    this.render = this.options.render || this.render
    this.noMatchFoundObj =  {}
    this.noMatchFoundObj['nomatchfound'] = 'x';
    this.noMatchFoundObj[this.options.property] = this.options.noMatchFoundText;
    this.onNoMatchFoundClick = this.options.onNoMatchFoundClick
    this.onlookup = this.options.onlookup || this.onlookup
    this.onblur = this.options.onblur || this.onblur
    this.minLength = this.options.minLength || this.minLength
    this.delay = this.options.delay
    this.onselect = this.options.onselect
    this.strings = true
    this.shown = false
    this.searching = ""
    this.listen()
  }

  Typeahead.prototype = {

    constructor: Typeahead
  , onlookup : function(query) {
	  
  }
  , onblur : function (elem) {
	  
  }
  , select: function () {
      var val = JSON.parse(this.$menu.find('.active').attr('data-value'))
        , text
        
      if(this.useNoMatchFound && val.nomatchfound) {
    	  if(this.onNoMatchFoundClick) {
    		  this.onNoMatchFoundClick(); 
    	  }
    	  return;
      }  
        
      if (!this.strings) text = val[this.options.property]
      else text = val

      this.$element.val(text)

      if (typeof this.onselect == "function")
          this.onselect(val)

      return this.hide()
    }

  , show: function () {
      var pos = $.extend({}, this.$element.offset(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu.css({
        top: pos.top + pos.height
      , left: pos.left
      })

      this.$menu.show()
      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var that = this
        , items
        , q
        , value
        
     
      this.query = this.$element.val()
      this.onlookup(this.query)  
 
      if (typeof this.source == "function") {
        value = this.source(this, this.query)
        if (value) this.process(value)
      } else {
        this.process(this.source)
      }
    }

  , process: function (results) {
      var that = this
        , items
        , q
      
       
      if (results.length && typeof results[0] != "string")
          this.strings = false
 
      if(this.useNoMatchFound && (results == null || results.length == 0)) {
    	  results.push(this.noMatchFoundObj);
    	  items = results;
      } else {
          
	      this.query = this.$element.val()
	
	      if (!this.query) {
	        return this.shown ? this.hide() : this
	      }
	
	      items = $.grep(results, function (item) {
	        if (!that.strings)
	          item = item[that.options.property]
	        if (that.matcher(item)) return item
	      })
	
	      items = this.sorter(items)
	
	      if (!items.length) {
	        return this.shown ? this.hide() : this
	      }
	      
      }

      return this.render(items.slice(0, this.options.items)).show()
    }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase())
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item
        , sortby

      while (item = items.shift()) {
        if (this.strings) sortby = item
        else sortby = item[this.options.property]

        if (!sortby.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~sortby.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , highlighter: function (item) {
      return item.replace(new RegExp('(' + this.query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', JSON.stringify(item))
        if(item.nomatchfound) {
	        	i.find('a').html(item.value);
	    } else { 
	        if (!that.strings)
	            item = item[that.options.property]
	        i.find('a').html(that.highlighter(item))
	    }
        return i[0]
      })

      items.first().addClass('active')
      this.$menu.html(items)
      return this
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      if (!next.length) {
        next = $(this.$menu.find('li')[0])
      }
      
      
      this.$menu.scrollTop(next.prop('scrollHeight') * next.prevAll().size());

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      if (!prev.length) {
        prev = this.$menu.find('li').last()
      }
      
      this.$menu.scrollTop(prev.prop('scrollHeight') * prev.prevAll().size());
      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if ($.browser.webkit || $.browser.msie) {
        this.$element.on('keydown', $.proxy(this.keypress, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
    }

  , keyup: function (e) {
      e.stopPropagation()
      e.preventDefault()

      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
          break

        case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          this.hide()
          break

        default:
        if(this.$element.val().length >= this.minLength)  {
        	
        	if(this.searching) {
        		clearTimeout(this.searching)
        	}
        	var that = this
        	this.hide();
        	this.searching = setTimeout(function() {
        		if(that.$element.val().length >= that.minLength) {
        			that.lookup()
        		}
        	}, this.delay)
        	
        } else {
        	this.hide();
        }
          
      }

  }

  , keypress: function (e) {
      e.stopPropagation()
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
          break

        case 38: // up arrow
          e.preventDefault()
          this.prev()
          break

        case 40: // down arrow
          e.preventDefault()
          this.next()
          break
      }
    }

  , blur: function (e) {
      var that = this
      e.stopPropagation()
      e.preventDefault()
      if(this.searching) {
    	  clearTimeout(this.searching)
      }
      this.onblur(this);
      setTimeout(function () { that.hide() }, 150)
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
    }

  , mouseenter: function (e) {
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  $.fn.typeahead = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , onselect: null
  , property: 'value'
  , minLength: 2
  , delay : 1000
  }

  $.fn.typeahead.Constructor = Typeahead


 /* TYPEAHEAD DATA-API
  * ================== */

  $(function () {
    $('body').on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
      var $this = $(this)
      if ($this.data('typeahead')) return
      e.preventDefault()
      $this.typeahead($this.data())
    })
  })

}( window.jQuery);
