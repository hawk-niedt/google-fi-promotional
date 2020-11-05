<#function optout url="https://google.com">
  <#return url>
</#function>

<#function track url="#" name="">
  <#return url>
</#function>

<#function open>
  <#return "">
</#function>

<#function manage_prefs>
  <#return "">
</#function>

<#function landing_page label="">
  <#return "" + label>
</#function>

<#function view_in_browser>
  <#return "[view_in_browser]">
</#function>

<#assign gamma_lib = "{\"campaignId\":\"1\", \"var_num\":4, \"messageId\":2, \"text\":\"bla bla\"}">
<#assign gamma = gamma_lib?eval>

<#if EmailAddress??>
  <#assign EmailAddress = EmailAddress />
<#else>
  <#assign EmailAddress = "user1234567890@google.com" />
</#if>