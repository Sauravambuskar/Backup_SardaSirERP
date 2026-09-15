function j(e,o){if(!e.length)return;const c=Object.keys(e[0]),r=[c.join(","),...e.map(l=>c.map(a=>{const i=l[a]??"";return`"${String(i).replace(/"/g,'""')}"`}).join(","))].join(`
`),s=new Blob([r],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(s),t=document.createElement("a");t.href=n,t.download=`${o}.csv`,t.click(),URL.revokeObjectURL(n)}export{j as e};
