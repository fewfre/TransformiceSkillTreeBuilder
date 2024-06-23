/**
 * tfm.skilltree.js 2.1
 *
 * Copyright (c) 2015 Evilsantah (http://cheese.formice.com/forum/members/evilsantah.170440/)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 *
 * 3/13/2015
**/

//////////////////////////////////////
// Helper Functions
//////////////////////////////////////
$.extend({getUrl:function(){var e=window.location.href;var t=e.indexOf("file")!=-1;var n=e.lastIndexOf(t?"?":"/");if(n==-1){return e}return e.slice(0,t?n:n+1)},getUrlVars:function(){var e={},t;var n=window.location.href.slice(window.location.href.indexOf("?")+1).split("&");for(var r=0;r<n.length;r++){t=n[r].split("=");e[""+t[0]]=t[1]}return e},getUrlVar:function(e){return $.getUrlVars()[e]}})

function jsonSize(obj) {
	var t = 0;
	for (key in obj) t++;
	return t;
}

function jsonConcat(a, b) {
	for (var key in b) a[key] = b[key];
	return a;
}

String.prototype.rtrim = function(e) {
	return this.replace(new RegExp(e + "*$", "g"), "");
}

function reportError(e, t) {
	console.log("TfmSkillTreeError :", e, t);
}

function isMac() {
	return navigator.appVersion.toUpperCase().indexOf("MAC") >= 0;
}

const LANGUAGES = {
	en: "English",
	br: "Português",
	tr: "Türkçe",
	es: "Español",
	fr: "Français",
	ru: "Русский",
	nl: "Nederlands",
	no: "Norsk",
	pl: "Polski",
	hu: "Magyar",
	ro: "Română",
	id: "Bahasa Indonesia",
	cn: "中文",
	lv: "Latviešu",
	it: "Italiano",
	bg: "Български",
};

// https://stackoverflow.com/a/29106129
function getFirstBrowserLanguage() {
    var nav = window.navigator,
    browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
    i,
    language;

    // support for HTML 5.1 "navigator.languages"
    if (Array.isArray(nav.languages)) {
      for (i = 0; i < nav.languages.length; i++) {
        language = nav.languages[i];
        if (language && language.length) {
          return language;
        }
      }
    }

    // support for other well known properties in browsers
    for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
      language = nav[browserLanguagePropertyKeys[i]];
      if (language && language.length) {
        return language;
      }
    }

    return null;
}

// Load from server if running locally
var docRoot = location.host ? "" : "https://projects.fewfre.com/a801/transformice/skill_tree/webapp/";

var i18n = {}, lastLang = "en";
function fetchLangData(lang) {
	lastLang = lang;
	console.log("(fetchLangData) ", lang);
	return fetch(`${docRoot}i18n/${lang}.json`)
	.then(response => response.json())
	.then(json => {
		i18n = json;
		skillData = setupSkillData(lang);
		return i18n;
	});
}

const MAX_LEVEL = 888;

var skillData;

//////////////////////////////////////
// Marionette extend stuff
//////////////////////////////////////
const TfmSkillTree = new Backbone.Marionette.Application();
const TfmSkillTableRegion = Backbone.Marionette.MultiRegion.extend({ el: "#skill-table" });
TfmSkillTree.addRegions({ mainRegion: TfmSkillTableRegion });

const Skill = Backbone.Model.extend({
	defaults: {
		id: 0,
		name: null,
		desc: null,
		level: 0,
		maxLevel: 5,
		disabled: true,
		tierIndex: -1,
		treeModel: null,
		statisticsModel: null
	},
	initialize: function() {
		_.bindAll(this, "increaseLevel", "decreaseLevel", "disable", "onRemainingPointsChange");
	},
	increaseLevel: function(e, t) {
		if (!this.get("disabled") && (this.get("statisticsModel").get("remainingPoints") - e >= 0 || t)) {
		var i = this.get("level") + e;
		if (i <= this.get("maxLevel")) {
			this.set("level", i);
			var n = this.get("treeModel");
			n && n.increaseSpentPoints(e);
		}
		}
	},
	decreaseLevel: function(e) {
		if (!this.get("disabled")) {
		var t = this.get("level") - e;
		if (t >= 0) {
			this.set("level", t);
			var i = this.get("treeModel");
			i && i.increaseSpentPoints(-e);
		}
		}
	},
	disable: function(e) {
		var t = 0;
		
		if(e) {
			t = this.get("level");
			this.set({ level: 0 }, { silent: true });
		}
		this.set({ disabled: e });
		
		return t;
	},
	onRemainingPointsChange: function(e) {
		var t = this.get("treeModel"),
		i = t.get("tiers"),
		n = this.get("tierIndex"),
		l = i.models[n];
		if (!l.get("disabled")) {
			var o = t.get("statisticsModel"),
			s = t.get("id"),
			a = o.get("level"),
			r = (0 == e && 0 == this.get("level")) || (s > 2 && 20 > a);
			this.disable(r);
		}
	},
});

const Skills = Backbone.Collection.extend({
	model: Skill
});

const SkillTier = Backbone.Model.extend({
	defaults: {
		index: 0,
		skills: {},
		treeModel: null,
		disabled: true
	}
});

const SkillTiers = Backbone.Collection.extend({
	model: SkillTier
});

const SkillTree = Backbone.Model.extend({
	defaults: {
		id: 0,
		name: null,
		spanClass: "",
		points: 0,
		tiers: {},
		statisticsModel: null
	},
	initialize: function() {
		_.bindAll(this, "increaseSpentPoints", "_getPointsBelowTier", "toURLData", "resetPoints");
	},
	increaseSpentPoints: function(e) {
		for (var t = this, i = this.get("tiers"), n = i.length, l = 0, o = this.get("statisticsModel"), s = false, a = o.get("remainingPoints"), r = n - 1; r >= 0; r--) {
		var h = i.models[r];
		if (!s) {
			var c = t._getPointsBelowTier(r);
			s = !(c >= 5 * (n - r - 1));
		}
		h.set({
			disabled: s
			}, {
			silent: true
			}),
			h.get("skills").each(function(e) {
			l += e.disable(s);
			});
		}
		this.set("points", this.get("points") + e - l), this.get("statisticsModel").set("remainingPoints", a - e + l);
	},
	_getPointsBelowTier: function(e) {
		var t = 0;
		return (
		this.get("tiers").each(function(i) {
			i.get("index") > e &&
			i.get("skills").each(function(e) {
				t += e.get("level");
			});
		}),
		t
		);
	},
	toURLData: function() {
		var e = {};
		this.get("tiers").each(function(t) {
			t.get("skills").each(function(t) {
				var i = t.get("level");
				if(i > 0) e[t.get("id")] = i;
			});
		});
		return e;
	},
	resetPoints: function() {
		for (var e = this, t = this.get("tiers"), i = t.length - 1; i >= 0; i--) {
			var n = t.models[i];
			n.get("skills").each(function(t) {
				var i = t.get("level");
				if(i > 0) { t.set("level", 0); e.increaseSpentPoints(-i); }
			});
		}
	},
});

const Statistics = Backbone.Model.extend({
	defaults: {
		level: 70,
		remainingPoints: 69,
		i18nRemainingPoints: "Remaining points",
		i18nRedistribute: "Redistribute",
		i18nShareit: "Share it!",
	},
	initialize: function() {
		_.bindAll(this, "increaseLevel");
	},
	increaseLevel: function(e, t, i) {
		var n = this.get("level");
		if ((n + e >= 1 && n + e <= MAX_LEVEL) || i) {
			var l = this.get("remainingPoints");
			if (l + e >= 0) return t || this.set({
				level: n + e,
				remainingPoints: l + e
			}), true;
		}
		return false;
	},
});

const SkillView = Backbone.Marionette.ItemView.extend({
	template: "#skill-template",
	tagName: "div",
	lastClickEvent: {
		pageX: 0,
		pageY: 0
	},
	events: {
		click: "onLeftClick",
		contextmenu: "onRightClick",
		mouseenter: "onHoverStart",
		mouseleave: "onHoverEnd",
		mousemove: "onMouseMove"
	},
	initialize: function() {
		this.listenTo(this.model, "change:level", this.render), this.listenTo(this.model, "change:disabled", this.render), this.listenTo(this.model.get("statisticsModel"), "change:remainingPoints", this.onRemainingPointsChange);
	},
	getSkillItemDOM: function() {
		return this.$el.children(".skill-item");
	},
	getTooltipDOM: function() {
		return this.$el.children(".skill-tooltip");
	},
	onRemainingPointsChange: function(e, t) {
		this.model.onRemainingPointsChange(t);
	},
	onRender: function() {
		var e = this.model.get("level"),
		t = this.model.get("maxLevel"),
		i = this.model.get("disabled"),
		n = "";
		e == t ? (n = "complete") : i ? (n = "disabled") : e > 0 && (n = "incomplete");
		var l = -30 * (this.model.get("id") - 1) - 1;
		this.getSkillItemDOM()
		.css({
			"background-position": l + "px -1px"
		})
		.removeClass("complete disabled incomplete")
		.addClass(n);
		var o = this.getTooltipDOM();
		o.children(".tooltip-desc").html(this._getDescription().replace("\n", "<br />")), this.lastClickEvent.clicked && !i && (this._positionToolTip(o, this.lastClickEvent), o.show()), (this.lastClickEvent.clicked = false);
	},
	_getDescription: function() {
		for (var level = Math.max(this.model.get("level"), 1), desc = this.model.get("desc"), regex = /\{\{(.*?)\}\}/, match;
		(match = regex.exec(desc));) {
		var formula = match[1],
			result = eval(formula);
		desc = desc.substring(0, match.index) + '<span class="tooltip-desc-var">' + result + "</span>" + desc.substr(match.index + formula.length + 4);
		}
		return desc;
	},
	_toggleHover: function(e) {
		//($.browser.mozilla || $.browser.msie || ($.browser.opera && parseInt($.browser.version) < 15)) && 
		this.$el.find(".skill-item-layer").toggleClass("hover", e);
		var t = this.getTooltipDOM();
		t.toggle(e);
	},
	onHoverStart: function() {
		this._toggleHover(true);
	},
	onHoverEnd: function() {
		this._toggleHover(false);
	},
	_positionToolTip: function(e, t) {
		var i = (this.getSkillItemDOM().offset(), e.width()),
		n = t.pageX + 8,
		l = 20,
		o = i + n - (window.innerWidth - l);
		o > 0 && (n = window.innerWidth - l - i), e.css({
		top: t.pageY + 15,
		left: n
		});
	},
	onMouseMove: function(e) {
		var t = this.getTooltipDOM();
		this._positionToolTip(t, e);
	},
	onLeftClick: function(e) {
		(e.clicked = true), (this.lastClickEvent = e), this.model.increaseLevel(1);
	},
	onRightClick: function(e) {
		return (e.clicked = true), (this.lastClickEvent = e), this.model.decreaseLevel(1), false;
	},
});

const SkillTierView = Backbone.Marionette.CollectionView.extend({
	tagName: "li",
	itemView: SkillView,
	initialize: function() {
		this.collection = this.model.get("skills");
	},
});

const SkillTreeView = Backbone.Marionette.CompositeView.extend({
	template: "#skill-tree-template",
	className: "skill-table-column",
	itemView: SkillTierView,
	itemViewContainer: "ul",
	initialize: function() {
		(this.collection = this.model.get("tiers")), this.listenTo(this.model, "change:points", this.changePoints);
	},
	changePoints: function(e, t) {
		this.$el.children(".points").html(t);
	},
});

const StatisticsPanel = Backbone.Marionette.ItemView.extend({
	template: "#stats-template",
	tagName: "div",
	className: "skill-table-column stats-panel",
	holdDownData: null,
	holdDownDelay: 500,
	lastProgressWidth: 0,
	events: {
		"mousedown #level-btn": "onLevelBtnMouseDown",
		"mouseup #level-btn": "onLevelBtnMouseUp",
		"mouseleave #level-btn": "onMouseLeave",
		"mousewheel #level-btn": "onMouseWheel",
		"DOMMouseScroll #level-btn": "onMouseWheel",
		"click #share-btn": "onShareClick",
		"click #redist-btn": "onRedistribute",
	},
	initialize: function() {
		this.listenTo(this.model, "change", this.render);
	},
	_onMouseDown: function(e, t) {
		var self = this;
		this.holdDownData = {
			levelUp: e,
			amount: 0,
			timer: setInterval(function() {
				self.holdDownData.amount++, self.holdDownData.amount > self.holdDownDelay / 100 && t.call(self);
			}, 100),
		};
	},
	_onMouseUp: function(e, t) {
		this.holdDownData.levelUp == e && this.holdDownData.amount < this.holdDownDelay / 100 && t.call(this), clearInterval(this.holdDownData.timer), (this.holdDownData.timer = null), this.onRender();
	},
	_isUpOrDown: function(e) {
		var t = this.$el.find("#level-btn").offset();
		return e.pageY - t.top < this.$el.height() / 2;
	},
	onLevelBtnMouseDown: function(e) {
		this._isUpOrDown(e) ? this._onMouseDown(true, this.levelUp) : this._onMouseDown(false, this.levelDown);
	},
	onLevelBtnMouseUp: function(e) {
		this._isUpOrDown(e) ? this._onMouseUp(true, this.levelUp) : this._onMouseUp(false, this.levelDown);
	},
	onMouseLeave: function() {
		null != this.holdDownData && (clearInterval(this.holdDownData.timer), (this.holdDownData.timer = null), this.onRender());
	},
	onMouseWheel: function(e) {
		e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 ? this.levelUp() : this.levelDown();
	},
	_level: function(e, t) {
		this.model.increaseLevel(e);
		var i = this.model.increaseLevel(e, true);
		return this.$el.find(t).toggle(i), i || (clearInterval(this.holdDownData.timer), (this.holdDownData.timer = null)), false;
	},
	levelUp: function() {
		return this._level(1, "#up-btn");
	},
	levelDown: function() {
		return this._level(-1, "#down-btn");
	},
	_getProminentSkillTree: function() {
		var e = null, t = 0;
		_.each(this.options.skillTrees, function(i) {
			if (i instanceof SkillTreeView) {
				var n = i.model.get("points");
				n > t && ((e = i.model), (t = i.model.get("points")));
			}
		});
		return e;
	},
	_getProminentClass: function() {
		var e = this._getProminentSkillTree();
		return null == e ? null : e.get("spanClass");
	},
	onRender: function() {
		var e = this.model.get("level"),
		t = this.$el.find("#level-label");
		t.css({ "font-size": (200 > e ? (100 > e ? 25 : 21) : 20) + "pt" });
		var i = this._getProminentClass(),
		n = this.$el.find("#level-btn");
		null != i && n.removeClass().addClass(i);
		var l = this.$el.find("#xp-bar-progress");
		null != i && l.removeClass().addClass(i), l.css({
		width: this.lastProgressWidth + "%"
		});
		var o = this.$el.find(".level-btn-img");
		if ((null != i ? o.removeClass("default") : o.addClass("default"), null == this.holdDownData || (null != this.holdDownData && null == this.holdDownData.timer))) {
		var s = this.model.get("remainingPoints"),
			a = (s / (e - 1)) * 100,
			r = Math.max(250, 20 * Math.abs(a - this.lastProgressWidth));
		(this.lastProgressWidth = a), l.animate({
			width: a + "%"
		}, r);
		}
	},
	_getURLData: function() {
		var e = { 0: this.model.get("level") };
		
		_.each(this.options.skillTrees, function(t) {
			if(t instanceof SkillTreeView) {
				e = jsonConcat(e, t.model.toURLData());
			}
		});
		return JSON.stringify(e);//jsonSize(e) == 1 && e[0] == 50 ? "" : JSON.stringify(e); -- we don't need backwards support for lvl 50 being blank
	},
	onShareClick: function() {
		const popup = $("#popup-overlay");
		let urlData = window.btoa(this._getURLData());
		let url = $.getUrl();
		
		let showShortLink = false; // Short link is fewfre.com specific
		if(url.indexOf("projects.fewfre.com") > -1) {
			showShortLink = true;
			url = "https://projects.fewfre.com/a801/transformice/skill_tree/";
		}
		if(urlData) {
			url += "?d=" + urlData.rtrim("=");
		}
		
		const $shareInput = popup.find("#share-link");
		const $bitlyButtonCont = popup.find("#bitly-button-cont");
		const $bitlyButton = popup.find("#bitly-button");
		const $bitlyInput = popup.find("#bitly-link");
		// If the url has changed - no reason to generate shortcode again
		if($shareInput.val() != url) {
			$shareInput.val(url);
			$shareInput.select();
			
			$bitlyButtonCont.toggle(showShortLink);
			$bitlyInput.toggle(showShortLink && $bitlyButtonCont.length); // Never show until bitly button clicked (and then hides itself)
			if(showShortLink) {
				$bitlyButton.on('click', ()=>{
					$bitlyButtonCont.remove();
					$bitlyInput.toggle(true);
					
					$bitlyInput.val("Loading...");
					this._requestBitly(url).then(function(shortUrl){
						$bitlyInput.val(shortUrl);
						$bitlyInput.select();
					}).catch(function(err){
						$bitlyInput.val(err.status != 429 ? "[Error]" : "[Error] Site's bit.ly monthly quota reached");
						console.error(err);
					});
				});
			}
		} else {
			(showShortLink ? $shareInput : $bitlyInput).select();
		}
		
		popup.fadeIn(200);
	},
	_requestBitly: function(shareUrl) {
		return new Promise(function(resolve,reject){
			const accessToken = "acf583b2ce5911cf43c2f1df77ec7af7f711cbcf";
			const data = { "long_url": shareUrl };
			
			$.ajax({
				url: "https://api-ssl.bitly.com/v4/shorten",
				cache: false,
				dataType: "json",
				method: "POST",
				contentType: "application/json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
				},
				data: JSON.stringify(data)
			})
			.done((resp) => { resolve(resp.link); })
			.fail(reject);
		});
	},
	onRedistribute: function() {
		_.each(this.options.skillTrees, function(e) {
		e instanceof SkillTreeView && e.model.resetPoints();
		});
	},
});

//////////////////////////////////////
// Start
//////////////////////////////////////
let skillsList = [], skillTiers2, skillTrees2;
$(function() {
	$(".skill-table-column").remove(); // Hacky fix to prevent double of everything
	TfmSkillTree.addInitializer(function(options) {
		const skillTrees = [];
		const statisticsModel = new Statistics();
		
		options.skillTrees.forEach((e)=>{
			const treeModel = new SkillTree(e);
			const skillTiers = new SkillTiers(e.tiers);
			skillTiers.each(function(st, i) {
				const skills = new Skills( st.get("skills") );
				skills.each(function(e) {
					skillsList.push(e);
					e.set({ tierIndex: i, treeModel, statisticsModel });
				}),
				st.set({ index: i, skills });
			});
			skillTiers2 = skillTiers;
			treeModel.set({ tiers: skillTiers, statisticsModel });
			skillTrees.push( new SkillTreeView({ model: treeModel }) );
		});
		skillTrees2 = skillTrees;
		
		// Check if url has share data
		var urlVars = $.getUrlVar("d");
		if (urlVars) {
			var json = window.atob(urlVars);
			json = JSON.parse(json);
			
			if (jsonSize(json) > 0) {
				var { "0":shamanLevel, ...skillLevels } = json;
				shamanLevel = parseInt(shamanLevel);
				
				if (shamanLevel > 0) {
					var levelsUsed = 0;
					for (var key in skillLevels) {
						if (parseInt(skillLevels[key]) < 0) {
							levelsUsed = 9999;
							break;
						}
						levelsUsed += parseInt(skillLevels[key]);
					}
					
					if(levelsUsed <= shamanLevel-1) {
						skillTrees.forEach((skillTree)=>{
							const tiers = skillTree.model.get("tiers").models;
							for (var i = tiers.length; i > 0; i--) {
								const tier = tiers[i - 1];
								tier.get("skills").each(function(skill) {
									var skillLevel = skillLevels[skill.get("id")];
									skillLevel && skill.increaseLevel(skillLevel, true);
								});
							}
						});
						statisticsModel.set({
							level: shamanLevel,
							remainingPoints: shamanLevel - levelsUsed - 1,
							i18nRedistribute: i18n["redistribute"],
							i18nShareit: i18n["shareit"],
							i18nRemainingPoints: i18n["remaining_points"],
						});
					} else {
						reportError("The user has provided invalid GET parameter(s).", skillLevels);
					}
				} else {
					reportError("The user has provided an invalid shaman level (GET 0).", shamanLevel);
				}
			}
		}
		var c = new StatisticsPanel({ model: statisticsModel, skillTrees: skillTrees });
		skillTrees.unshift(c);
		TfmSkillTree.mainRegion.show(skillTrees);
		if(statisticsModel.get("remainingPoints") == 0) {
			statisticsModel.increaseLevel(1, false, true);
			statisticsModel.increaseLevel(-1, false, true);
		}
	});
	
	let lang = getFirstBrowserLanguage()?.split("-")?.[0];
	lang = LANGUAGES[lang] ? lang : "en"; // Only use supported languages
	fetchLangData(lang).then(function(){
		translateNonSkillData(lang);
		TfmSkillTree.start({ skillTrees: skillData });
	});
	
	// Share Popup Setup
	function hidePopup() { $("#popup-overlay").fadeOut(200); }
	$("#close-btn").on("click", hidePopup);
	$("#popup-overlay").on("click", hidePopup).find("div").on("click", function(e){ e.stopPropagation(); });
	$('#popup-overlay input[type="text"]').on("click", function() {
		this.select();
	});
	$("#popup-overlay input").val(""); // I can't figure out where this keeps getting an initial value from, so hard clearing it
	
	// Handled by localization now
	// if(isMac()) {
	// 	$("span.hotkey").each(function() {
	// 		var txt = $(this).html().replace("Ctrl", "Cmd");
	// 		$(this).html(txt);
	// 	});
	// }
	
	// Lang Setup
	$("#lang-picker").on("click", _openLangSelect);
});

function setupSkillData() {
	const desc=(key, arg1) => arg1 ? i18n[key].replace("%1", arg1) : i18n[key];
	const makeSkill=(id, iKey, arg1, options) => ({ id, name:i18n[`${iKey}_T`], desc:desc(iKey, arg1), ...options });
	
	return [
		{
			"id": 0,
			"name": i18n["C_GuideSprirituel"],
			"spanClass": "green",
			"points": 0,
			"tiers": [
				{
					"skills": [
						makeSkill(31, "C_14", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(3, "C_11", "{{level}}"),
						makeSkill(14, "C_12", "{{level*4}}"),
						makeSkill(4, "C_13", "{{3}}", { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(44, "C_8", "{{level}}"),
						makeSkill(36, "C_9", "{{level}}"),
						makeSkill(6, "C_10", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(11, "C_5", "{{level}}"),
						makeSkill(24, "C_6", "{{level}}"),
						makeSkill(39, "C_7", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(41, "C_2", "{{level*4}}"),
						makeSkill(7, "C_3", "{{level}}"),
						makeSkill(26, "C_4", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(5, "C_0", "{{level*5}}", { disabled:false }),
						makeSkill(10, "C_1", "{{level*10}}", { disabled:false }),
					],
					"disabled": false
				}
			]
		},
		{
			"id": 1,
			"name": i18n["C_MaitresseDuVent"],
			"spanClass": "blue",
			"points": 0,
			"tiers": [
				{
					"skills": [
						makeSkill(18, "C_34", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(17, "C_31", "{{level}}"),
						makeSkill(12, "C_32", "{{level}}"),
						makeSkill(13, "C_33", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(29, "C_28", "{{level*2}}"),
						makeSkill(37, "C_29", "{{level}}"),
						makeSkill(46, "C_30", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(43, "C_25", "{{level}}"),
						makeSkill(45, "C_26", "{{level}}"),
						makeSkill(40, "C_27", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(9, "C_22", "{{level*20}}"),
						makeSkill(16, "C_23", "{{level*10}}"),
						makeSkill(15, "C_24", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(28, "C_20", "{{level*4}}", { disabled:false }),
						makeSkill(42, "C_21", "{{level}}", { disabled:false }),
					],
					"disabled": false
				}
			]
		},
		{
			"id": 2,
			"name": i18n["C_Mecanicienne"],
			"spanClass": "orange",
			"points": 0,
			"tiers": [
				{
					"skills": [
						makeSkill(22, "C_54", "{{30}}", { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(25, "C_51", "{{level}}"),
						makeSkill(34, "C_52", "{{level}}"),
						makeSkill(30, "C_53", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(1, "C_48", "{{level}}"),
						makeSkill(27, "C_49", "{{level*6}}"),
						makeSkill(8, "C_50", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(38, "C_45", "{{level*10}}"),
						makeSkill(35, "C_46", "{{level}}"),
						makeSkill(32, "C_47", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(20, "C_42", "{{level*20}}"),
						makeSkill(21, "C_43", "{{level*20}}"),
						makeSkill(33, "C_44", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(23, "C_40", "{{level*10}}", { disabled:false }),
						makeSkill(2, "C_41", "{{level}}", { disabled:false }),
					],
					"disabled": false
				}
			]
		},
		{
			"id": 3,
			"name": i18n["C_Sauvageonne"],
			"spanClass": "yellow",
			"points": 0,
			"tiers": [
				{
					"skills": [
						makeSkill(76, "C_94", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(62, "C_80", "{{level}}"),
						makeSkill(75, "C_93", "{{level}}"),
						makeSkill(57, "C_70", "{{2}}", { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(59, "C_72", "{{level}}"),
						makeSkill(63, "C_81", "{{level}}"),
						makeSkill(74, "C_92", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(53, "C_66", "{{level}}"),
						makeSkill(58, "C_71", "{{level}}"),
						makeSkill(60, "C_73", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(55, "C_68", "{{level*4}}"),
						makeSkill(70, "C_88", "{{level}}"),
						makeSkill(66, "C_84", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(68, "C_86", "{{level*4}}", { disabled:false }),
						makeSkill(71, "C_89", "{{level*4}}", { disabled:false }),
					],
					"disabled": false
				}
			]
		},
		{
			"id": 4,
			"name": i18n["C_Physicienne"],
			"spanClass": "purple",
			"points": 0,
			"tiers": [
				{
					"skills": [
						makeSkill(73, "C_91", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(65, "C_83", "{{level}}"),
						makeSkill(67, "C_85", "{{level*2}}"),
						makeSkill(72, "C_90", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(50, "C_63", "{{level*2}}"),
						makeSkill(61, "C_74", "{{level*2}}"),
						makeSkill(69, "C_87", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(64, "C_82", "{{level*2}}"),
						makeSkill(47, "C_60", "{{level}}"),
						makeSkill(51, "C_64", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(52, "C_65", "{{level*2}}"),
						makeSkill(56, "C_69", "{{level}}"),
						makeSkill(54, "C_67", null, { maxLevel:1 }),
					]
				},
				{
					"skills": [
						makeSkill(48, "C_61", "{{level}}", { disabled:false }),
						makeSkill(49, "C_62", "{{level}}", { disabled:false }),
					],
					"disabled": false
				}
			]
		}
	];
}

//////////////////////////////////////
// Translation Stuff
//////////////////////////////////////
async function setLanguage(lang) {
	await fetchLangData(lang);
	
	skillTrees2.forEach((skillTree, skillTreeI)=>{
		if(skillTreeI == 0) { return; }
		
		skillTree.model.set({ name: skillData[skillTreeI-1].name });
		
		const tiers = skillTree.model.get("tiers").models;
		for (var tierI = tiers.length; tierI > 0; tierI--) {
			const tier = tiers[tierI - 1];
			tier.get("skills").each(function(skill, skillI) {
				const { name, desc } = skillData[skillTreeI-1].tiers[tierI-1].skills[skillI];
				skill.set({ name, desc });
			});
		}
	});
	skillTrees2[0].model.set({
		i18nRedistribute: i18n["redistribute"],
		i18nShareit: i18n["shareit"],
		i18nRemainingPoints: i18n["remaining_points"],
	})
	TfmSkillTree.mainRegion.show(skillTrees2);
	
	translateNonSkillData(lang);
}

function translateNonSkillData(lang) {
	const createdby = regexNameToLink(i18n["createdby"]);
	const translatedby = regexNameToLink(i18n["translatedby"]);
	$("#footer").html(createdby + (translatedby ? "<hr style='margin:3px;' />"+translatedby : translatedby));
	
	$("#popup-window .indent").html( i18n["copy_hotkey"].replace("$1", `<span class="hotkey">${isMac() ? "Cmd" : "Ctrl"}-C</span>`).replace("{{0}}", `<span class="hotkey">${isMac() ? "Cmd" : "Ctrl"}-C</span>`) );
	$("#skill-tree-title").html(i18n["title"]);
	if(i18n["getbitlylink"]) $("#bitly-button").html( i18n["getbitlylink"] );
	if(i18n["getbitlylink_desc"]) $("#bitly-button-cont p").html( i18n["getbitlylink_desc"] );
	
	$("#lang-picker .btn img").attr("src", `images/flags/${lang}.png`);
}

function regexNameToLink(text) {
	return text.replaceAll(/\[(.*?)\]/g, (_,name)=>`<a href="https://atelier801.com/profile?pr=${name}" target="_blank">${name}</a>`);
}
	
/******************************
* Server Select
*******************************/
function _openLangSelect() {
	var html = "";
	
	const langToBtn = ([code,name])=>`<button class='lang-button ${code==lastLang ? "selected" : ""}' data-lang='${code}'><img src='images/flags/${code}.png' /> ${name}</button>`;
	var columns = [], tLangArray = Object.entries(LANGUAGES);
	for(let i = 0; i < Math.ceil(tLangArray.length/6); i++) {
		var langs = tLangArray.slice(i*6, (i+1)*6); // Split into 6 langs per column
		var btns = langs.map(langToBtn).join("");
		columns.push(`<div class='lang-button-column'>${btns}</div>`);
	}
	html += columns.join("");
	
	$.featherlight($("<div/>", { html:html }), { otherClose:".lang-button" });
	
	$(".lang-button:not(.selected)").on("click", function(){
		const lang = $(this).data("lang");
		setLanguage(lang);
	});
}