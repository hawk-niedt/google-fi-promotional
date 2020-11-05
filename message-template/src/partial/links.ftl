<!-- 
    Campaign Boilerplate link partial.
    
    HTML comments in this style will be printed in PT in Gamma.
    Replace with "{# #}" style comments for production.
    See "Gamma Links" section below for example.

    The "defaults" section should not need to be changed except the UTM builder.
-->

<!-- defaults -->
{# Gamma Links #}
    {# GMKS snippets #}
    <#include '/gkmsid/9877999' ignore_missing=true /> {# lpage #}
    <#include '/gkmsid/9882423' ignore_missing=true/> {# footer address #}

    {# lpage #}
    <#assign lpage_yes = track(landing_page() + '#Yes', 'Yes') />
    <#assign lpage_maybe = track(landing_page() + '#Maybe', 'Maybe') /> 
    <#assign lpage_no = track(landing_page() + '#No', 'No') />
{# end Gamma links #}

<!-- UTM builder --> <!-- remove or replace if you don't need -->
<#function link url track_name anchor="">

  <#local 
    utm_source = "utm_source=" + "promo"
    utm_medium = "&utm_medium=" + "email_crm"
    utm_campaign = "&utm_campaign=" + "GS105392"
    utm_term= "&utm_term=" + track_name
    utm_content= "&utm_content=${gamma.messageId}"
  >
  {#- Concatenate UTMs 
  ..... [concateSymbol] will be replaced upon returning!
  #}
  <#local utm = "[concateSymbol]" + utm_source + utm_medium + utm_campaign + utm_term + utm_content>

  {#- Automate Concatenate Symbol #}
  <#local utmConcate = (url?contains("?"))?then("&", "?")>
  {#- OUTPUT #}
  <#return track(url + utm?replace("[concateSymbol]",utmConcate) + anchor, track_name)>
</#function>
<!-- end UTM builder -->

<!-- end defaults -->


<!-- Add local(message specific) links here -->
{%- if env.content_type|lower == "email" or env.content_type|lower == "plaintext" %}

{# Masthead #}
<#assign masthead_logo = link("TBD.com", "MastheadLogo") />

{%- else %}

  {# landing page links #}
  <#assign lp_logo = "https://services.google.com/fh/files/emails/google_nest_logo_146x50_2x.png" />
  <#assign lp_logo_link = "https://store.google.com/category/connected_home" />
  <#assign lp_privacy = "https://www.google.com/policies/privacy/" />
  <#assign lp_terms= "https://www.google.com/policies/terms/" />
  <#assign lp_logo_alt = "Google Nest" />
  <#assign lp_logo_width = "73" />
  
{%- endif -%}