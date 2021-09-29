# -*- coding: utf-8 -*-
import web , datetime , os, time, re, cgi , json
from web import form
import conf

def parse_config_variables(text:str, conf):
	""" Parses and replace the variables in the text by their values from config.

	Parameters
	----------
	text: str
		The input string representing the config
	conf
		The config module

	Returns
	-------
	str
		The same text with the replaced wildards
	"""
	params = {
        '$myEndpoint': conf.myEndpoint,
        '$myPublicEndpoint': conf.myPublicEndpoint
    }
	for k, v in params.items():
		text = text.replace(k, v)
	return text

def get_form(json_form):
	""" read config in 'myform.json' and return a webpy form """
	import io
	with open(json_form) as config_form:
		# The StringIO wrapper was used to re-use the json.load function
		# without any other change.
		text = config_form.read()
		text = parse_config_variables(text, conf)
		buf = io.StringIO(text)
		buf.seek(0)
		fields = json.load(buf)

	params = ()

	for field in fields:
		# all
		myid = field['id']
		description = field['label'] if 'label' in field and len(field['label']) > 0 else 'input'
		pre_a = "<span class='tip' data-toggle='tooltip' data-placement='bottom' title='"
		pre_b = "'><i class='fas fa-info-circle'></i></span>"
		prepend = pre_a+field['prepend']+pre_b if 'prepend' in field and len(field['prepend']) > 0 else ''
		disabled = field['disabled'] if 'disabled' in field and len(field['disabled']) > 0 else ''
		classes = field['class'] if 'class' in field and len(field['class']) > 0 else ''
		classes = classes+' searchWikidata' if 'searchWikidata' in field and field['searchWikidata'] == 'True' else classes
		classes = classes+' disambiguate' if "disambiguate" in field and field["disambiguate"] == 'True' else classes
		classes = classes+' ('+conf.main_entity+')'
		autocomplete = field['cache_autocomplete'] if 'cache_autocomplete' in field and len(field['cache_autocomplete']) > 0 else ''

		# text box
		placeholder = field['placeholder'] if 'placeholder' in field else None
		default = field['defaultvalue'] if 'defaultvalue' in field else ''
		# dropdown
		dropdown_values = [(k,v) for k,v in field['values'].items()] if 'values' in field else None

		# Text box
		if field['type'] == 'Textbox':
			if "disambiguate" in field and field["disambiguate"] == 'True':
				vpass = form.regexp(r".{1,200}$", 'must be between 1 and 200 characters')
				params = params + (form.Textbox(myid, vpass,
				description = description,
				id=myid,
				placeholder=placeholder,
				pre = prepend,
				class_= classes,
				value=default) , )
			else:
				params = params + (form.Textbox(myid,
				description = description,
				id=myid,
				placeholder=placeholder,
				pre = prepend,
				class_= classes,
				value=default), )

		if field['type'] == 'Dropdown':
			params = params + (form.Dropdown(myid,
			description = description,
			args=dropdown_values,
			placeholder=placeholder,
			id=myid,
			pre = prepend,
			class_= classes), )

		if field['type'] == 'Checkbox':
			prepend_title = '<section class="checkbox_group_label label col-12">'+description+'</section>'
			i = 0
			params = params + (form.Checkbox(myid+'-'+str(i),
			value=dropdown_values[0][0]+','+dropdown_values[0][1],
			description = dropdown_values[0][1],
			id=myid,
			pre = prepend_title+prepend,
			class_= classes+' checkbox_group',
			checked=False), )

			for value in dropdown_values[1:]:
				i += 1
				params = params + (form.Checkbox(myid+'-'+str(i),
				value=value[0]+','+value[1],
				description = value[1],
				id=myid,
				pre = '',
				class_= classes+' checkbox_group following_checkbox',
				checked=False), )

	myform = form.Form(*params)
	return myform


searchRecord = form.Form(
	form.Textbox("search",
    	class_="searchWikidata col-md-11",
    	description="Search",
    	autocomplete="off")
)


#searchGeneral = form.Form(
    #form.Textbox("search",
        #class_="searchGeneral",
        #description="search",
        #autocomplete="off")
#)
