/** Shared Xedruo Identity REST-function bridge. Company pages own UI and return paths. */
export async function signInWithXedruoId({supabase,xedruoId,password,companySlug}) {
  if (!supabase?.functions?.invoke || !supabase?.auth?.setSession) throw new Error("Xedruo Identity client is not configured.");
  const id=String(xedruoId||"").trim().toUpperCase();
  if (!/^[A-Z]{2}-?\d{10}$/.test(id) || !password) throw new Error("Enter your Xedruo ID and password.");
  const {data,error}=await supabase.functions.invoke("xedruo-id-login",{body:{xedruo_id:id,password,company_slug:companySlug}});
  if(error) throw new Error(error.message||"Xedruo ID sign-in failed.");
  if(!data?.access_token||!data?.refresh_token||data?.company!==companySlug) throw new Error(data?.error||"The company authentication response was invalid.");
  const {error:sessionError}=await supabase.auth.setSession({access_token:data.access_token,refresh_token:data.refresh_token});
  if(sessionError) throw sessionError;
  return data.user||null;
}
export async function signInWithGoogle({supabase,companyOrigin,returnPath}) {
  const origin=String(companyOrigin||"").replace(/\/$/,"");
  const path=String(returnPath||"/").startsWith("/")?String(returnPath||"/"):"/";
  if(!origin) throw new Error("Company return address is missing.");
  const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:origin+path,queryParams:{prompt:"select_account"}}});
  if(error) throw error;
}
