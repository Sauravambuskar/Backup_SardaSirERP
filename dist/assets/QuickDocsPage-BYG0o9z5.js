import{c as re,k as C,b4 as b,j as _,I as V,l as $,F as L,o as A}from"./index-Y-QuJU_g.js";import{P as oe}from"./PageHeader-BfzJBt_h.js";import{L as le}from"./label-KXZzaDd9.js";import{T as z}from"./textarea-BtnaxzPu.js";import{S as ie,a as ne,b as se,c as de,d as ce}from"./select-B_9WaMeC.js";import{C as w,a as W,b as E,c as j,d as he}from"./card-DqKtMmdt.js";import{E as ue}from"./jspdf.es.min-Btv1ovh-.js";import{S as G}from"./sparkles-Cr4FXw7H.js";import{P as pe}from"./pencil-BvZsDSro.js";import{C as me}from"./copy-iCQzpNUQ.js";import{D as fe}from"./download-Eq24O5jl.js";import"./index-CNgAMf6t.js";import"./check-C_P7KtFG.js";import"./browser-BzbuF3Iy.js";const ye=[["path",{d:"M15 12h-5",key:"r7krc0"}],["path",{d:"M15 8h-5",key:"1khuty"}],["path",{d:"M19 17V5a2 2 0 0 0-2-2H4",key:"zz82l3"}],["path",{d:"M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",key:"1ph1d7"}]],S=re("scroll-text",ye),k=["Hon'ble ___ th Addl. C.J.M., Akola","Hon'ble J.M.F.C., Akola","Hon'ble ___ th Addl. C.J.M., Washim","Hon'ble Civil Judge Senior Division, Washim","Hon'ble Civil Judge Junior Division, Akola","District and Session Court, Akola","Hon'ble ___ th Addl. Sessions Judge, Akola","Other (type below)"],x=[{id:"issue_process",label:"Application for Issue Process (Sec. 204 CrPC)",icon:b,description:"Application for passing issue process order U/S 204 of Cr.P.C.",category:"criminal",fields:[{key:"courtName",label:"Court Name",placeholder:"Select court...",required:!0,type:"select",options:k},{key:"caseNumber",label:"SCC No.",placeholder:"e.g. SCC 123/2024",required:!0,halfWidth:!0},{key:"filingFor",label:"F.F.",placeholder:"e.g. F.F.",halfWidth:!0},{key:"complainant",label:"Complainant",placeholder:"Name of Complainant",required:!0},{key:"accused",label:"Accused / Opposite Party",placeholder:"Name of Accused",required:!0},{key:"orderDate",label:"Date of Order U/S 202",placeholder:"e.g. 21.11.2022",required:!0,halfWidth:!0},{key:"date",label:"Application Date",placeholder:"",type:"date",halfWidth:!0},{key:"place",label:"Place",placeholder:"e.g. Akola",halfWidth:!0},{key:"advocateName",label:"Counsel Name",placeholder:"Advocate Name",halfWidth:!0},{key:"additionalFacts",label:"Additional Facts (optional)",placeholder:"Any extra facts to include...",type:"textarea"}],generate:e=>{const o=e.date?new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):"____/____/________";return`BEFORE THE HON'BLE ${e.courtName?.toUpperCase()||"________________"}

${e.caseNumber||"SCC. ____/____"}                                              ${e.filingFor||"F.F."}

${e.complainant||"________________"}
                              ...Complainant
                    vs
${e.accused||"________________"}
                              ...Accused

APPLICATION FOR PASSING ISSUE PROCESS ORDER UNDER SECTION 204 OF Cr.P.C.

The Counsel for complainant most humbly submits as under:

1)  That the present matter is fixed on today's board for report U/S. 202 of Cr.P.C.. It is submitted that on dated ${e.orderDate||"________"} the hon'ble court has passed an order u/s 202 of Crpc. It is submitted that the hon'ble court has not received any report till today of the same. Moreover it is submitted that as per sec 202 of Cr.P.C., the magistrate i.e. presiding officer trying the case may inquire into the case himself. It is submitted that there is no use of waiting for the report as it results in prolonging the matter unnecessarily.

${e.additionalFacts?`2)  ${e.additionalFacts}

`:""}Hence considering the above said facts this application may kindly be allowed and inquiry may kindly be done by this hon'ble court itself and issue process order u/s 204 may kindly be passed in the interest of justice.


PRAYER:  It is therefore prayed that considering the above said facts this application may kindly be allowed and inquiry may kindly be done by this hon'ble court itself and issue process order u/s 204 may kindly be passed in the interest of justice.

${e.place||"Akola"}

Date:- ${o}                                          ${e.advocateName||"________________"}
                                                        Counsel for Complainant`}},{id:"replace_name",label:"Application for Replacing Authorized Person",icon:S,description:"Replace name of authorized person of complainant company (NI Act cases)",category:"criminal",fields:[{key:"courtName",label:"Court Name",placeholder:"Select court...",required:!0,type:"select",options:k},{key:"caseNumber",label:"SCC No.",placeholder:"e.g. SCC 456/2020",required:!0,halfWidth:!0},{key:"filingFor",label:"F.F.",placeholder:"e.g. F.F.",halfWidth:!0},{key:"companyName",label:"Complainant Company",placeholder:"e.g. Crystal Crop Protection Pvt. Ltd.",required:!0},{key:"accused",label:"Accused",placeholder:"Name of Accused",required:!0},{key:"oldPerson",label:"Outgoing Authorized Person",placeholder:"e.g. Mr. Vijay Ramchandra Ghatole",required:!0},{key:"newPerson",label:"New Authorized Person",placeholder:"e.g. Mr. Piyushkumar",required:!0},{key:"resignReason",label:"Reason for Change",placeholder:"e.g. resigned from company",halfWidth:!0},{key:"date",label:"Date",placeholder:"",type:"date",halfWidth:!0},{key:"place",label:"Place",placeholder:"e.g. Akola",halfWidth:!0},{key:"advocateName",label:"Counsel Name",placeholder:"Advocate Name",halfWidth:!0},{key:"deponentName",label:"Deponent Full Name (Optional)",placeholder:"e.g. Omprakash Laxminarayan Mundhada"},{key:"deponentAge",label:"Deponent Age (Optional)",placeholder:"e.g. 52",halfWidth:!0},{key:"deponentOcc",label:"Deponent Occupation (Optional)",placeholder:"e.g. Service",halfWidth:!0},{key:"deponentAddress",label:"Deponent Address (Optional)",placeholder:"e.g. R/o. Akola, Tq. Dist- Akola"}],generate:e=>{const o=e.date?new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):"____/____/20__";return`IN THE COURT OF ${e.courtName?.toUpperCase()||"HON'BLE ________________"}

${e.caseNumber||"SCC NO. ____/20__"}                                           ${e.filingFor||"F.F."}

${e.companyName||"________________"} ---- V/S ---- ${e.accused||"________________"}

APPLICATION FOR REPLACING THE NAME OF AUTHORIZED PERSON OF COMPLAINANT

The Counsel for complainant most humbly & respectfully submits as under:-

1]  That in the above said matter complainant Company filed complaint u/s 138 of N.I. ACT through its authorized person ${e.oldPerson||"________________"}, now the said complaint is fixed for evidence.

2]  Now thereafter ${e.oldPerson||"________________"} has ${e.resignReason||"resigned from complainant company"}. Now the company has appointed ${e.newPerson||"________________"}, who is the authorized person on behalf of company, hence now the name of ${e.newPerson||"________________"} is replacing at the place of ${e.oldPerson||"________________"}.

3]  There is no any harm cause to any person if the name of authorized person of complainant is changed.

    Hence application may kindly be allowed and the name of ${e.newPerson||"________________"} may kindly be replaced in the place of ${e.oldPerson||"________________"}, in the interest of justice.

PRAYER:-  Application may kindly be allowed and the name of ${e.newPerson||"________________"} may kindly be replaced in the place of ${e.oldPerson||"________________"}, in the interest of justice.

${e.place||"AKOLA"}

DATE: ${o}                                           ${e.advocateName||"________________"}
                                                        COUNSEL FOR COMPLAINANT


────────────────────────────────────────────────────────

AFFIDAVIT

    I, ${e.deponentName||"________________"}, Age-${e.deponentAge||"__"} years, Occ. ${e.deponentOcc||"________"}, ${e.deponentAddress||"R/o. ________________"}, does hereby take an oath and state on solemn affirmation as under:-

    That the content of above paras Nos. 1 to 3 in the Application are drafted by my counsel as per my instruction and the same are read over and explained to me in vernacular language, I admit the same to be true and correct to the best of my own knowledge and belief.

                   Hence this affidavit.

                                                        ………………………
                                                          DEPONENT


VERIFICATION

    I, ${e.deponentName||"________________"}, Age-${e.deponentAge||"__"} years, Occ. ${e.deponentOcc||"________"}, ${e.deponentAddress||"R/o. ________________"}, Deponent, do hereby verify that, the content of above affidavit are true and correct to the best of my knowledge and belief.

    Hence, sworn, signed and verified at ${e.place||"Akola"} on this
    day of ________-20__.

${e.place||"Akola"}                                   ………………………
DATE: ${o}                                             DEPONENT

I know the deponent,
Who has signed before me.

(${e.advocateName||"Advocate"}, ${e.place||"Akola"})`}}];x.push({id:"file_documents",label:"Application to File Documents",icon:L,description:"Permission to file documents on record in civil suit",category:"civil",fields:[{key:"courtName",label:"Court Name",placeholder:"Select court...",required:!0,type:"select",options:k},{key:"caseNumber",label:"Case No.",placeholder:"e.g. R.C.S. No. 227/2024",required:!0,halfWidth:!0},{key:"filingFor",label:"F.F. / Next Date",placeholder:"e.g. F.F. 16/12/2025",halfWidth:!0},{key:"plaintiff",label:"Plaintiff Name",placeholder:"e.g. Miss Rajeshri",required:!0},{key:"defendant",label:"Defendant(s)",placeholder:"e.g. Rambhau & Others",required:!0},{key:"suitType",label:"Suit Filed For",placeholder:"e.g. grant of temporary Injunction along with other relief"},{key:"exhibitNo",label:"Hearing Below Exhibit",placeholder:"e.g. Exh. 5",halfWidth:!0},{key:"docPurpose",label:"Purpose of Filing Documents",placeholder:"e.g. real controversy involved in the matter",type:"textarea"},{key:"date",label:"Date",placeholder:"",type:"date",halfWidth:!0},{key:"place",label:"Place",placeholder:"e.g. Akola",halfWidth:!0},{key:"advocateName",label:"Counsel Name",placeholder:"Advocate Name",halfWidth:!0}],generate:e=>{const o=e.date?new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):"____/____/________";return`IN THE COURT OF HON'BLE ${e.courtName?.toUpperCase()||"________________"}

${e.caseNumber||"R.C.S. No. ____/____"}                            ${e.filingFor||"F.F. ____/____/____"}

${e.plaintiff||"________________"}

                              ….Plaintiff
                    Versus

${e.defendant||"________________"}

                              ….Defendant(s)

APPLICATION FOR GRANT OF PERMISSION TO FILE THE DOCUMENTS

The counsel for plaintiff most humbly submits as under,

    That, the Plaintiff has filed the present suit for ${e.suitType||"________________"}. That, the matter is kept on today for hearing${e.exhibitNo?` below ${e.exhibitNo}`:""}. That, the Plaintiff wants to file some material documents on record which are ${e.docPurpose||"real controversy involved in the matter"} and therefore, plaintiff may kindly be permitted to file the documents on record in the interest of justice.

PRAYER:  An application may kindly be allowed and plaintiff may kindly be permitted to file the documents on record in the interest of justice.



${e.place||"Akola"}

Date: ${o}                                           ${e.plaintiff||"________________"}
                                                        Plaintiff



                                                        ${e.advocateName||"________________"}
                                                        Counsel for Plaintiff`}},{id:"list_documents",label:"List of Documents",icon:S,description:"List of documents filed on behalf of party in civil suit",category:"civil",fields:[{key:"courtName",label:"Court Name",placeholder:"Select court...",required:!0,type:"select",options:k},{key:"caseNumber",label:"Case No.",placeholder:"e.g. R.C.S. No. 227/2024",required:!0,halfWidth:!0},{key:"filingFor",label:"F.F. / Next Date",placeholder:"e.g. F.F. 16/12/2025",halfWidth:!0},{key:"plaintiff",label:"Plaintiff Name",placeholder:"e.g. Miss Rajeshri",required:!0},{key:"defendant",label:"Defendant(s)",placeholder:"e.g. Rambhau & Others",required:!0},{key:"partyType",label:"Documents on behalf of",placeholder:"e.g. Plaintiff",halfWidth:!0},{key:"documentsList",label:"Documents (one per line: Sr.No | Particulars | Date)",placeholder:`1 | Notice | 09/09/2024
2 | Complaint to Chief Secretary | 26/11/2024
3 | Writ Petition with Order | 06/08/2025`,required:!0,type:"textarea"},{key:"date",label:"Date",placeholder:"",type:"date",halfWidth:!0},{key:"place",label:"Place",placeholder:"e.g. Akola",halfWidth:!0},{key:"advocateName",label:"Counsel Name",placeholder:"Advocate Name",halfWidth:!0}],generate:e=>{const o=e.date?new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):"____/____/________",l=(e.documentsList||"").split(`
`).filter(Boolean).map(d=>{const m=d.split("|").map(N=>N.trim());return{sr:m[0]||"",particulars:m[1]||"",docDate:m[2]||"--"}}),n=Math.max(14,...l.map(d=>d.particulars.length)),s=`  SR. NO.    PARTICULARS${" ".repeat(Math.max(0,n-11))}    DATE`,g="  "+"─".repeat(8)+"  "+"─".repeat(n+4)+"  "+"─".repeat(12),p=l.map(d=>`  ${d.sr.padEnd(8)}  ${d.particulars.padEnd(n+4)}  ${d.docDate}`).join(`
`);return`IN THE COURT OF HON'BLE ${e.courtName?.toUpperCase()||"________________"}

${e.caseNumber||"R.C.S. No. ____/____"}                            ${e.filingFor||"F.F. ____/____/____"}

${e.plaintiff||"________________"} ….Versus…. ${e.defendant||"________________"}

LIST OF DOCUMENTS ON BEHALF OF ${(e.partyType||"PLAINTIFF").toUpperCase()}

${s}
${g}
${p}
${g}


${e.place||"Akola"}

Date: ${o}                                           ${e.plaintiff||"________________"}
                                                        ${e.partyType||"Plaintiff"}



                                                        ${e.advocateName||"________________"}
                                                        Counsel for ${e.partyType||"Plaintiff"}`}},{id:"pursis",label:"Pursis",icon:b,description:"Pursis for Civil Judge Senior Division, Washim",category:"civil",fields:[{key:"caseNumber",label:"R.C.S. No.",placeholder:"e.g. R.C.S. No. 227/2024",required:!0,halfWidth:!0},{key:"filingFor",label:"F.F. Date",placeholder:"e.g. 16/12/2025",halfWidth:!0},{key:"plaintiff",label:"Plaintiff Name",placeholder:"e.g. Miss Rajeshri",required:!0},{key:"defendant",label:"Defendant(s)",placeholder:"e.g. Rambhau & Others",required:!0},{key:"pursisBody",label:"Pursis Body (submission text)",placeholder:"Enter the specific submission here...",required:!0,type:"textarea"},{key:"date",label:"Date",placeholder:"",type:"date",halfWidth:!0},{key:"place",label:"Place",placeholder:"e.g. Akola",halfWidth:!0},{key:"advocateName",label:"Counsel for Plaintiff",placeholder:"Advocate Name",halfWidth:!0}],generate:e=>{const o=e.date?new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):"____/____/________";return`IN THE COURT OF HON'BLE CIVIL JUDGE SENIOR DIVISION WASHIM

${e.caseNumber||"R.C.S. No. ____/____"}                             F.F. ${e.filingFor||"____/____/____"}

${e.plaintiff||"________________"}
….Versus….
${e.defendant||"________________"}

PURSIS

The applicant respectfully submits that ${e.pursisBody||"________________"}

Hence, the present pursis is submitted for the kind perusal and record of this Hon'ble Court.


${e.place||"Akola"}
Date. ${o}                                                ${e.plaintiff||"________________"}
                                                             Plaintiff



                                                             ${e.advocateName||"________________"}
                                                             Counsel for Plaintiff`}});x.push({id:"warrant_bailable",label:"Warrant (Bailable / Non-Bailable) - Sec. 75 CrPC",icon:b,description:"Bailable or Non-Bailable Warrant, JMFC Akola (two copies as per court format)",category:"criminal",fields:[{key:"warrantType",label:"Warrant Type",placeholder:"BAILABLE or NON-BAILABLE",required:!0,halfWidth:!0},{key:"sccNo",label:"SCC No.",placeholder:"e.g. SCC 123/2024",required:!0,halfWidth:!0},{key:"complainant",label:"Complainant",placeholder:"Name of Complainant",required:!0},{key:"accused",label:"Accused (Vs)",placeholder:"Name of Accused",required:!0},{key:"ffDate",label:"F.F. Date",placeholder:"e.g. ____/___/2024",halfWidth:!0},{key:"whereasText",label:"Whereas (charge details)",placeholder:"e.g. Full name & address of accused",type:"textarea"},{key:"bailAmount",label:"Bail Amount (Rs.)",placeholder:"e.g. 10,000",halfWidth:!0},{key:"attendDate",label:"Attend Before Date (Dt.)",placeholder:"e.g. 15/03/2025",halfWidth:!0},{key:"issueDate",label:"Date of Issue",placeholder:"e.g. 01/02/2025",halfWidth:!0},{key:"policeStation",label:"Police Station",placeholder:"e.g. Ramdaspeth, Akola",halfWidth:!0},{key:"courtNo",label:"Court No.",placeholder:"e.g. 3",halfWidth:!0}],generate:e=>{const l=`BEFORE THE HON'BLE JUDICIAL MAGISTRATE FIRST CLASS, AKOLA (MAHARASHTRA)
         (see Section 75 of Cr.P.C.)
${(e.warrantType||"BAILABLE / NON-BAILABLE").toUpperCase()} WARRANT
SCC No. ${e.sccNo||"____/____"}              ${e.complainant||"________________"} Vs ${e.accused||"________________"}
F.F. ${e.ffDate||"____/___/2024"}
Whereas ${e.whereasText||"______________________________________________________________________________________________________"}
Stands charged with the offence under Section 138 of N.I. Act. You are hereby directed to arrest the said accused to produce before me on or before mentioned date herein fail not.
         If the accused ${e.accused||"______________________________________"} shall give bail himself in sum of Rs ${e.bailAmount||"_________________"} with one surety in the same amount to attend before me on the Dt. ${e.attendDate||"________________"} and to continue so to attend until otherwise directed by me, he may be released.
Date of Issue: ${e.issueDate||"_____/____/2024"}
Police Station ${e.policeStation||"________________________"}
                                                              (                              )
______________________________________
Judicial Magistrate First Class
Seal                                                          Court No. ${e.courtNo||"___"} Akola, Maharashtra`;return`${l}


─────────────────────────────────────────────────────────────────────────────────────────────────────

${l}`}},{id:"warrant_crpc_421",label:"Warrant for Recovery of Interim Compensation (Sec. 421 CrPC)",icon:b,description:"Warrant to District Collector for recovery under Sec. 143A NI Act (two copies)",category:"criminal",fields:[{key:"courtType",label:"Court Type",placeholder:"JMFC or Additional Chief Judicial Magistrate",required:!0},{key:"courtNo",label:"Court No.",placeholder:"e.g. 3",required:!0,halfWidth:!0},{key:"sccNo",label:"S.C.C. No.",placeholder:"e.g. SCC 456/2023",required:!0,halfWidth:!0},{key:"fixedFor",label:"Fixed For",placeholder:"e.g. 15/03/2025",halfWidth:!0},{key:"complainant",label:"Complainant",placeholder:"Name of Complainant",required:!0},{key:"accused",label:"Accused",placeholder:"Name of Accused",required:!0},{key:"accusedAddress",label:"Accused Address (R/o.)",placeholder:"Full address of accused",type:"textarea"},{key:"warrantDay",label:"Day of Warrant",placeholder:"e.g. 10th January 2025",halfWidth:!0},{key:"twentyPercent",label:"20% Amount (Rs.)",placeholder:"e.g. 50,000",halfWidth:!0},{key:"chequeAmount",label:"Cheque Amount (Rs.)",placeholder:"e.g. 2,50,000",halfWidth:!0},{key:"orderDate",label:"Order Dated",placeholder:"e.g. 01/11/2024",halfWidth:!0},{key:"exhibitNo",label:"Below Exh. (if ACJM)",placeholder:"e.g. Exh. 1",halfWidth:!0},{key:"issueDay",label:"Issued on Day",placeholder:"e.g. 15th",halfWidth:!0},{key:"issueMonth",label:"Issued Month",placeholder:"e.g. March",halfWidth:!0},{key:"issueYear",label:"Issued Year (20__)",placeholder:"e.g. 25",halfWidth:!0},{key:"collectorAddress",label:"District Collector Address (3 lines)",placeholder:`Line1
Line2
Line3`,type:"textarea"}],generate:e=>{const o=(e.courtType||"").toUpperCase().includes("ADDITIONAL")?`${e.courtType?.toUpperCase()||"__ ADDITIONAL CHIEF JUDICIAL MAGISTRATE"}, COURT NO.${e.courtNo||"___"}, AKOLA, MAHARASHTRA`:`JUDICIAL MAGISTRATE FIRST CLASS, COURT NO.${e.courtNo||"___"}, AKOLA, MAHARASHTRA`,l=(e.collectorAddress||`__________________
__________________
__________________`).split(`
`),n=(e.courtType||"").toUpperCase().includes("ADDITIONAL")?` below Exh${e.exhibitNo||"___"}`:"",s=`${o}
WARRANT FOR RECOVERY OF INTERIM COMPENSATION
(See Section 421 of Cr.P.C.)

 S.C.C. NO ${e.sccNo||"____________"}
         Fixed For: ${e.fixedFor||"____________"}

${e.complainant||"___________________________"} versus ${e.accused||"__________________________"}
To,
The District Collector,
${l[0]||"__________________"}
${l[1]||"__________________"}
${l[2]||"__________________"}


Whereas the accused ${e.accused||"____________________________________"}
R/o. ${e.accusedAddress||"______________________________________________________________________________________________________"}
On the day of ${e.warrantDay||"_________"} warrant for recovery of Interim compensation was issued under section 421 of Cr.P.C. as the accused failed to comply the direction to pay 20% amount of Rs.${e.twentyPercent||"___________"} of the cheque of Rs.${e.chequeAmount||"___________"} as per section 143 A of Negotiable Instruments Act, in the present case as per order dated${e.orderDate||"________"}${n}.
Whereas the said accused ${e.accused||"______________________________"}, although required to pay the said Interim compensation, has not paid the same or any part of thereof;
You are hereby authorized and requested to realize the amount of the said Interim compensation as arrears of Land revenue from the movable or immovable property, or both, of the said accused ${e.accused||"_________________________________"} and to certify without delay what you may have done in pursuance of this order.
Issued on today ${e.issueDay||"___"} day of ${e.issueMonth||"_________"} 20${e.issueYear||"__"} with the sign and seal of the court.
Date:-
Court Seal                                                ${o.includes("ADDITIONAL")?"__Additional Chief Judicial Magistrate ,":"__Judicial Magistrate First Class,"}
                                                        Court No.${e.courtNo||"___"},Akola, Maharashtra`;return`${s}



─────────────────────────────────────────────────────────────────────────────────────────────────────

${s}`}},{id:"proclamation_notice",label:"Proclamation Notice (Form No. 4, Sec. 82 CrPC)",icon:b,description:"Proclamation Notice against accused to remain present - ACJM, Akola",category:"criminal",fields:[{key:"acjmNumber",label:"ACJM Number (e.g. 3rd)",placeholder:"e.g. 3rd",required:!0,halfWidth:!0},{key:"courtNo",label:"Court No.",placeholder:"e.g. 5",required:!0,halfWidth:!0},{key:"sccNo",label:"S.C.C. No.",placeholder:"e.g. SCC 1317/2020",required:!0,halfWidth:!0},{key:"fixedFor",label:"Fixed For",placeholder:"e.g. 10/08/2022",halfWidth:!0},{key:"complainant",label:"Complainant",placeholder:"Name of Complainant",required:!0},{key:"accused",label:"Accused",placeholder:"Name of Accused",required:!0},{key:"accusedAddress",label:"Accused Address (R/o)",placeholder:"Full address of accused",type:"textarea"},{key:"appearanceDate",label:"Appearance Date",placeholder:"e.g. 15/04/2025",required:!0,halfWidth:!0},{key:"proclamationDay",label:"Proclamation Day",placeholder:"e.g. 10th",halfWidth:!0},{key:"proclamationMonth",label:"Proclamation Month",placeholder:"e.g. March",halfWidth:!0},{key:"proclamationYear",label:"Proclamation Year",placeholder:"e.g. 2025",halfWidth:!0},{key:"date",label:"Date",placeholder:"",type:"date",halfWidth:!0}],generate:e=>{const o=e.date?new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):"____/____/________";return`FORM NO. 4

${e.acjmNumber||"___"} ADDITIONAL CHIEF JUDICIAL MAGISTRATE, COURT NO. ${e.courtNo||"___"}, AKOLA

PROCLAMATION NOTICE AGAINST THE ACCUSED PERSON TO REMAIN PRESENT

See Section 82 of Cr.P.C.

S.C.C. No. ${e.sccNo||"____________"}
Fixed For: ${e.fixedFor||"____________"}

${e.complainant||"________________"}
                              ...Complainant
                    Versus
${e.accused||"________________"}
                              ...Accused

Whereas the accused ${e.accused||"________________"}, R/o ${e.accusedAddress||"________________"} has done or is subjected to punishment of offence under section 138 of Negotiable Instruments Act, 1881 and it appears that a Non-Bailable Warrant has been issued against the accused ${e.accused||"________________"} who has evaded the execution of the said warrant and the said accused ${e.accused||"________________"} has absconded or is concealing himself / herself to avoid the execution of warrant issued against him / her.

Therefore, this proclamation notice under section 82 of Cr.P.C. is issued directing the accused ${e.accused||"________________"} to appear before this court on dated ${e.appearanceDate||"________________"} at 11:00 AM to answer the said complaint, and if the accused ${e.accused||"________________"} fails to appear at the specified place and specified time, the case will be proceeded against as declared proclaimed offender under section 83 of Cr.P.C.

Hence this Proclamation is issued today on ${e.proclamationDay||"___"} day of ${e.proclamationMonth||"_________"} ${e.proclamationYear||"20__"} under my hand and seal of this Court.

Date: ${o}

Court Seal                                              ${e.acjmNumber||"___"} Additional Chief Judicial Magistrate
                                                        Court No. ${e.courtNo||"___"}, Akola, Maharashtra`}},{id:"show_cause_notice",label:"Show Cause Notice to Police Station",icon:b,description:"Show cause notice to police for non-execution of warrant (JMFC, Akola)",category:"criminal",fields:[{key:"courtName",label:"Court Name",placeholder:"Select court...",required:!0,type:"select",options:k},{key:"sccNo",label:"S.C.C. No.",placeholder:"e.g. SCC 1317/2020",required:!0,halfWidth:!0},{key:"ffDate",label:"F.F. Date",placeholder:"e.g. ____/____/2022",halfWidth:!0},{key:"complainant",label:"Complainant",placeholder:"e.g. AXIS CROP SCIENCE",required:!0},{key:"accused",label:"Accused (V/S)",placeholder:"e.g. JAI DURGA",required:!0},{key:"policeStation",label:"Police Station Name",placeholder:"e.g. Police Station Kaithal",required:!0},{key:"policeAddress",label:"Police Station Address",placeholder:"e.g. Tehsil Road, Main Bazar, Old City, Kaithal, Dist.- Kaithal, Haryana 136027",type:"textarea"},{key:"warrantType",label:"Warrant Type Issued",placeholder:"e.g. Bailable Warrant",halfWidth:!0},{key:"fixedForDate",label:"Warrant Fixed For Date",placeholder:"e.g. 10.08.2022",halfWidth:!0},{key:"refusedDate",label:"Date Warrant Refused",placeholder:"e.g. 29.06.2022",halfWidth:!0},{key:"explainByDate",label:"Explain By Date",placeholder:"e.g. _______.2022",halfWidth:!0},{key:"date",label:"Date",placeholder:"",type:"date",halfWidth:!0},{key:"place",label:"Place",placeholder:"e.g. Akola",halfWidth:!0}],generate:e=>{const o=e.date?new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):"____/____/________";return`IN THE COURT OF ${e.courtName?.toUpperCase()||"___JMFC, AKOLA"}.

SHOW CAUSE NOTICE

                                                                 S.C.C. NO. ${e.sccNo||"____/____"}
                                            ${e.complainant||"________________"} V/S ${e.accused||"________________"}
                                                                     F. F. ${e.ffDate||"____/____/____"}
TO,
Police Station Incharge,
${e.policeStation||"________________"},
${e.policeAddress||"________________"}

Subject:- Report of warrant issued in S.C.C. NO. ${e.sccNo||"____/____"} in ${e.complainant||"________________"} V/S ${e.accused||"________________"}

That in the above said matter ${e.warrantType||"Bailable Warrant"} was issued accused in the above said matter against the accused and the humdast of the said BW was sent to you which was fixed for ${e.fixedForDate||"________"}. The said warrant you refused on dated ${e.refusedDate||"________"} and the refused article of the same also received to this court. Because of the said refusal of warrant the above said case is being delayed as you refused to comply with the court's order to execute the bailable warrant.

Therefore you are hereby directed to explain that why warrant not served or executed against the said accused person, on or before dated ${e.explainByDate||"_______.____"}.

Date :- ${o}
${e.place||"Akola"}                                          ________________________________,
                                                        ${e.courtName||"___ Judicial Magistrate First Class"}
                                                        District Court, Akola, M.S.
Seal of Court`}});x.push({id:"adjournment",label:"Adjournment Application",icon:S,description:"Application for grant of adjournment (Civil Judge Senior Division, Washim)",category:"general",fields:[{key:"caseNumber",label:"R.C.S. No.",placeholder:"e.g. R.C.S. No. 227/2024",required:!0,halfWidth:!0},{key:"filingFor",label:"F.F. Date",placeholder:"e.g. 16/12/2025",halfWidth:!0},{key:"plaintiff",label:"Plaintiff / Applicant",placeholder:"e.g. Miss Rajeshri",required:!0},{key:"defendant",label:"Defendant(s)",placeholder:"e.g. Rambhau & Others",required:!0},{key:"reason",label:"Reason for Adjournment",placeholder:"e.g. advocate is engaged in another court / medical reasons",type:"textarea"},{key:"date",label:"Date",placeholder:"",type:"date",halfWidth:!0},{key:"place",label:"Place",placeholder:"e.g. Akola",halfWidth:!0},{key:"advocateName",label:"Counsel for Plaintiff",placeholder:"Advocate Name",halfWidth:!0}],generate:e=>{const o=e.date?new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):"____/____/________";return`IN THE COURT OF HON'BLE CIVIL JUDGE SENIOR DIVISION WASHIM

${e.caseNumber||"R.C.S. No. ____/____"}                             F.F. ${e.filingFor||"____/____/____"}

${e.plaintiff||"________________"}
….Versus….
${e.defendant||"________________"}

APPLICATION FOR GRANT OF ADJOURNMENT

The cousel for plaintiff most humbly submits as under,
                                That the above-named matter is listed before this Hon'ble Court on today's board. That, the applicant is unable to proceed with the matter today due to ${e.reason||"___"} and hence seeks adjournment. That the present request is made without any intention to delay the proceedings, and the applicant assures this Hon'ble Court of full cooperation on the next date. Hence adjournment may kindly be granted by allowing this application in the interest of justice.

Prayer: the applicant most respectfully prays that this Hon'ble Court may be pleased to Kindly allow the present application, and Be pleased to grant a adjournment of the matter, in the interest of justice.

${e.place||"Akola"}
Date. ${o}                                                ${e.plaintiff||"________________"}
                                                             Plaintiff



                                                             ${e.advocateName||"________________"}
                                                             Counsel for Plaintiff`}},{id:"personal_exception",label:"Application for Personal Exception (Exemption from Appearance)",icon:S,description:"Exemption from personal appearance of accused (Civil Judge Senior Division, Washim)",category:"general",fields:[{key:"caseNumber",label:"R.C.S. No.",placeholder:"e.g. R.C.S. No. 227/2024",required:!0,halfWidth:!0},{key:"filingFor",label:"F.F. Date",placeholder:"e.g. 16/12/2025",halfWidth:!0},{key:"plaintiff",label:"Plaintiff / Applicant",placeholder:"e.g. Miss Rajeshri",required:!0},{key:"defendant",label:"Defendant(s)",placeholder:"e.g. Rambhau & Others",required:!0},{key:"accusedNo",label:"Accused No.",placeholder:"e.g. 1",halfWidth:!0},{key:"reason",label:"Reason for Exemption",placeholder:"e.g. suffering from ill-health / medical difficulty / unavoidable personal difficulty",type:"textarea"},{key:"date",label:"Date",placeholder:"",type:"date",halfWidth:!0},{key:"place",label:"Place",placeholder:"e.g. Akola",halfWidth:!0},{key:"advocateName",label:"Counsel for Plaintiff",placeholder:"Advocate Name",halfWidth:!0}],generate:e=>{const o=e.date?new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):"____/____/________",l=e.accusedNo||"___";return`IN THE COURT OF HON'BLE CIVIL JUDGE SENIOR DIVISION WASHIM

${e.caseNumber||"R.C.S. No. ____/____"}                             F.F. ${e.filingFor||"____/____/____"}

${e.plaintiff||"________________"}
….Versus….
${e.defendant||"________________"}

APPLICATION FOR GRANT OF ADJOURNMENT

The counsel for plaintiff most humbly submits as under,
That the above-mentioned matter is fixed before this Hon'ble Court on today's board. That Accused No. ${l} is presently ${e.reason||"suffering from ill-health / medical difficulty / unavoidable personal difficulty"}, and due to the same is unable to remain personally present before this Hon'ble Court today. That the absence of Accused No. ${l} is neither intentional nor deliberate, and the applicant undertakes to remain present on the next date as directed by this Hon'ble Court. Hence it is requested that exemption from personal appearance may be granted for today, and the same would be in the interest of justice.

Prayer: Hon'ble Court may be pleased to Kindly exempt Accused No. ${l} from personal appearance for today in the interest of justice by allowing this application.

${e.place||"Akola"}
Date. ${o}                                                ${e.plaintiff||"________________"}
                                                             Plaintiff



                                                             ${e.advocateName||"________________"}
                                                             Counsel for Plaintiff`}});function Pe(){const[e,o]=C.useState(""),[l,n]=C.useState({date:new Date().toISOString().slice(0,10)}),[s,g]=C.useState(null),[p,d]=C.useState(!1),[m,N]=C.useState(""),c=x.find(t=>t.id===e),Y=t=>{o(t),n({date:new Date().toISOString().slice(0,10)}),g(null),d(!1)},K=()=>{if(!c){A.error("Select a template first");return}const t=c.fields.filter(r=>r.required&&!l[r.key]);if(t.length>0){A.error(`Please fill: ${t.map(r=>r.label).join(", ")}`);return}const a=c.generate(l);g(a),N(a),d(!1),A.success("Document generated!")},Q=()=>{navigator.clipboard.writeText(p?m:s||""),A.success("Copied to clipboard!")},X=()=>{const t=p?m:s||"";if(!t)return;const a=new ue({orientation:"portrait",unit:"mm",format:"a4"}),r=a.internal.pageSize.getWidth(),D=a.internal.pageSize.getHeight(),y=25,I=20,T=25,M=25,v=r-y-I,F=6.2;let i=T;const H=h=>{i+h>D-M&&(a.addPage(),i=T)};a.setFont("times","normal"),a.setFontSize(12);const q=t.split(`
`);for(let h=0;h<q.length;h++){const O=q[h],u=O.trim();if(/^[\u2500\u2550]+$/.test(u)){H(6),i+=2,a.setDrawColor(150),a.setLineWidth(.3),a.line(y,i,r-I,i),i+=4;continue}if(u===""){i+=F*.5,i>D-M&&(a.addPage(),i=T);continue}const P=O.length-O.trimStart().length,ee=P>=30,_e=P>=15&&P<30,U=/^(IN THE COURT|BEFORE THE HON|FORM NO)/.test(u),J=/^(APPLICATION FOR|LIST OF|AFFIDAVIT|VERIFICATION|PRAYER|PURSIS|SHOW CAUSE|PROCLAMATION|WARRANT|BAILABLE|NON-BAILABLE)/.test(u),ae=/^(vs|versus|\u2026\.?Versus\u2026\.?|\.\.\.\.?versus\.\.\.\.?|v\/s)/i.test(u),te=/^\.\.\.\.(Plaintiff|Defendant|Applicant|Respondent|Complainant|Accused)/i.test(u)||/^\.\.\.(Plaintiff|Defendant|Applicant|Respondent|Complainant|Accused)/i.test(u);U||J?a.setFont("times","bold"):a.setFont("times","normal"),a.setFontSize(12);const R=a.splitTextToSize(u,v);for(const f of R)H(F),U&&R.length<=2?a.text(f,r/2,i,{align:"center"}):J&&R.length<=2?a.text(f,r/2,i,{align:"center"}):ae?a.text(f,y+30,i):te?a.text(f,y+35,i):ee?a.text(f,r-I,i,{align:"right"}):_e?a.text(f,y+25,i):a.text(f,y,i),i+=F}const B=a.getNumberOfPages();for(let h=1;h<=B;h++)a.setPage(h),a.setFont("times","normal"),a.setFontSize(9),a.setTextColor(120),a.text(`Page ${h} of ${B}`,r/2,D-10,{align:"center"}),a.setTextColor(0);a.save(`${c?.label||"document"}.pdf`),A.success("PDF downloaded!")},Z=[{key:"criminal",label:"Criminal"},{key:"civil",label:"Civil"},{key:"general",label:"General"}];return _.jsxs("div",{className:"space-y-6 animate-in fade-in duration-500",children:[_.jsx(oe,{title:"Quick Docs",breadcrumbs:[{label:"Dashboard",path:"/"},{label:"Quick Docs"}]}),_.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[_.jsx("div",{className:"lg:col-span-1 space-y-4",children:_.jsxs(w,{className:"border border-border shadow-sm",children:[_.jsx(W,{className:"pb-3",children:_.jsx(E,{className:"text-base",children:"Select Template"})}),_.jsx(j,{className:"space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar",children:Z.map(t=>{const a=x.filter(r=>r.category===t.key);return a.length===0?null:_.jsxs("div",{children:[_.jsx("p",{className:"text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2",children:t.label}),a.map(r=>_.jsxs("div",{onClick:()=>Y(r.id),className:`p-3 rounded-lg cursor-pointer border transition-all mb-2 ${e===r.id?"border-primary bg-primary/5 shadow-sm":"border-transparent hover:bg-muted/40"}`,children:[_.jsxs("div",{className:"flex items-center gap-2",children:[_.jsx(r.icon,{className:"w-4 h-4 text-primary flex-shrink-0"}),_.jsx("span",{className:"text-sm font-medium leading-tight",children:r.label})]}),_.jsx("p",{className:"text-[11px] text-muted-foreground mt-1 ml-6",children:r.description})]},r.id))]},t.key)})})]})}),_.jsx("div",{className:"lg:col-span-1",children:_.jsxs(w,{className:"border border-border shadow-sm",children:[_.jsxs(W,{className:"pb-3",children:[_.jsxs(E,{className:"text-base flex items-center gap-2",children:[_.jsx(G,{className:"w-4 h-4 text-primary"}),c?c.label:"Fill Details"]}),c&&_.jsx(he,{className:"text-xs",children:c.description})]}),_.jsx(j,{className:"space-y-3 max-h-[65vh] overflow-y-auto custom-scrollbar",children:c?_.jsxs(_.Fragment,{children:[_.jsx("div",{className:"grid grid-cols-2 gap-3",children:c.fields.map(t=>_.jsxs("div",{className:t.halfWidth?"col-span-1":"col-span-2",children:[_.jsxs(le,{className:"text-xs font-semibold text-muted-foreground",children:[t.label,t.required&&" *"]}),t.type==="textarea"?_.jsx(z,{placeholder:t.placeholder,value:l[t.key]||"",onChange:a=>n(r=>({...r,[t.key]:a.target.value})),className:"bg-muted/50 text-sm min-h-[70px] mt-1"}):t.type==="select"&&t.options?_.jsxs("div",{className:"space-y-1.5 mt-1",children:[_.jsxs(ie,{value:l[t.key]||"",onValueChange:a=>n(r=>({...r,[t.key]:a==="Other (type below)"?"":a})),children:[_.jsx(ne,{className:"bg-muted/50 text-sm",children:_.jsx(se,{placeholder:t.placeholder||"Select..."})}),_.jsx(de,{children:t.options.map(a=>_.jsx(ce,{value:a,children:a},a))})]}),(l[t.key]===""||!t.options.includes(l[t.key]||""))&&_.jsx(V,{placeholder:"Or type custom court name...",value:l[t.key]||"",onChange:a=>n(r=>({...r,[t.key]:a.target.value})),className:"bg-muted/50 text-sm"})]}):_.jsx(V,{type:t.type||"text",placeholder:t.placeholder,value:l[t.key]||"",onChange:a=>n(r=>({...r,[t.key]:a.target.value})),className:"bg-muted/50 text-sm mt-1"})]},t.key))}),_.jsxs($,{onClick:K,className:"w-full mt-4",children:[_.jsx(G,{className:"w-4 h-4 mr-2"})," Generate Document"]})]}):_.jsx("p",{className:"text-sm text-muted-foreground py-8 text-center",children:"\\u2190 Select a template to begin"})})]})}),_.jsx("div",{className:"lg:col-span-1",children:_.jsxs(w,{className:"border border-border shadow-sm h-full",children:[_.jsx(W,{className:"pb-3",children:_.jsxs("div",{className:"flex items-center justify-between",children:[_.jsxs(E,{className:"text-base flex items-center gap-2",children:[_.jsx(L,{className:"w-4 h-4 text-primary"})," Preview"]}),s&&_.jsxs("div",{className:"flex gap-1",children:[_.jsx($,{variant:"ghost",size:"icon",className:"h-7 w-7",onClick:()=>{d(!p),p||N(s)},title:"Edit",children:_.jsx(pe,{className:"w-3.5 h-3.5"})}),_.jsx($,{variant:"ghost",size:"icon",className:"h-7 w-7",onClick:Q,title:"Copy",children:_.jsx(me,{className:"w-3.5 h-3.5"})}),_.jsx($,{variant:"ghost",size:"icon",className:"h-7 w-7",onClick:X,title:"Download",children:_.jsx(fe,{className:"w-3.5 h-3.5"})})]})]})}),_.jsx(j,{children:s?p?_.jsx(z,{value:m,onChange:t=>N(t.target.value),className:"font-mono text-xs leading-relaxed min-h-[500px] bg-muted/20 border-border"}):_.jsx("div",{className:"bg-white dark:bg-muted/20 border border-border rounded-lg p-5 min-h-[500px] max-h-[70vh] overflow-y-auto custom-scrollbar",children:_.jsx("pre",{className:"whitespace-pre-wrap text-xs font-mono leading-relaxed text-foreground",children:s})}):_.jsxs("div",{className:"flex flex-col items-center justify-center min-h-[400px] text-center",children:[_.jsx(L,{className:"w-12 h-12 text-muted-foreground opacity-30 mb-3"}),_.jsx("p",{className:"text-sm font-medium text-muted-foreground",children:"Generated document will appear here"}),_.jsx("p",{className:"text-xs text-muted-foreground mt-1",children:"Select template \\u2192 Fill details \\u2192 Generate"})]})})]})})]})]})}export{Pe as default};
