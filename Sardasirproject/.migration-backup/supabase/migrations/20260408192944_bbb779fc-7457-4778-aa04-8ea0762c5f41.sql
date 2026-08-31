
INSERT INTO public.clients (user_id,name,email,phone,city,state,country) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Rajesh Kumar','rajesh.kumar@gmail.com','+91 98765 43210','Mumbai','Maharashtra','India'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Priya Sharma','priya.sharma@outlook.com','+91 87654 32109','New Delhi','Delhi','India'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Amit Patel','amit.patel@yahoo.com','+91 76543 21098','Ahmedabad','Gujarat','India'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Sunita Verma','sunita.verma@gmail.com','+91 65432 10987','Jaipur','Rajasthan','India'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Vikram Singh','vikram.singh@hotmail.com','+91 54321 09876','Chandigarh','Punjab','India'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Deepa Nair','deepa.nair@gmail.com','+91 43210 98765','Kochi','Kerala','India');

INSERT INTO public.advocates (user_id,name,email,phone,specialization,bar_number,status) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Adv. Sanjay Mehta','sanjay.mehta@lawfirm.in','+91 99887 76655','Criminal Law','MH/2345/2010','active'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Adv. Kavita Reddy','kavita.reddy@lawfirm.in','+91 99776 65544','Family Law','DL/5678/2012','active'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Adv. Arun Joshi','arun.joshi@lawfirm.in','+91 99665 54433','Corporate Law','GJ/1234/2015','active'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Adv. Meera Iyer','meera.iyer@lawfirm.in','+91 99554 43322','Property Law','KL/8901/2018','active'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Adv. Rohit Gupta','rohit.gupta@lawfirm.in','+91 99443 32211','Civil Litigation','RJ/4567/2014','active');

INSERT INTO public.cases (user_id,case_number,title,description,client_id,advocate_id,case_type,court_name,filing_date,status) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','CIV/2024/001','Kumar vs. ABC Builders','Property dispute over flat possession delay',(SELECT id FROM clients WHERE name='Rajesh Kumar' LIMIT 1),(SELECT id FROM advocates WHERE name='Adv. Meera Iyer' LIMIT 1),'Civil','Mumbai High Court','2024-03-15','open'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','CRM/2024/002','State vs. Unknown','Cheque bounce case under Section 138 NI Act',(SELECT id FROM clients WHERE name='Priya Sharma' LIMIT 1),(SELECT id FROM advocates WHERE name='Adv. Sanjay Mehta' LIMIT 1),'Criminal','Patiala House Court, Delhi','2024-05-10','open'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','FAM/2024/003','Sharma Divorce Petition','Mutual consent divorce petition',(SELECT id FROM clients WHERE name='Priya Sharma' LIMIT 1),(SELECT id FROM advocates WHERE name='Adv. Kavita Reddy' LIMIT 1),'Family','Family Court, New Delhi','2024-06-20','in_progress'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','CRP/2024/004','Patel Corp Merger','Corporate merger approval and SEBI compliance',(SELECT id FROM clients WHERE name='Amit Patel' LIMIT 1),(SELECT id FROM advocates WHERE name='Adv. Arun Joshi' LIMIT 1),'Corporate','NCLT Ahmedabad','2024-07-01','open'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','CIV/2024/005','Verma Land Dispute','Agricultural land ownership dispute',(SELECT id FROM clients WHERE name='Sunita Verma' LIMIT 1),(SELECT id FROM advocates WHERE name='Adv. Rohit Gupta' LIMIT 1),'Civil','Jaipur District Court','2024-08-12','in_progress'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','CRM/2024/006','State vs. Ravi Khanna','Fraud and forgery charges under IPC 420',(SELECT id FROM clients WHERE name='Vikram Singh' LIMIT 1),(SELECT id FROM advocates WHERE name='Adv. Sanjay Mehta' LIMIT 1),'Criminal','Sessions Court, Chandigarh','2024-04-05','open'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','PRO/2024/007','Nair Property Partition','Ancestral property partition among family',(SELECT id FROM clients WHERE name='Deepa Nair' LIMIT 1),(SELECT id FROM advocates WHERE name='Adv. Meera Iyer' LIMIT 1),'Property','Kerala High Court','2024-09-01','open'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','CIV/2023/008','Kumar Insurance Claim','Life insurance claim rejection dispute',(SELECT id FROM clients WHERE name='Rajesh Kumar' LIMIT 1),(SELECT id FROM advocates WHERE name='Adv. Rohit Gupta' LIMIT 1),'Civil','Consumer Forum, Mumbai','2023-11-20','closed');

INSERT INTO public.hearings (user_id,case_id,hearing_date,court_name,judge_name,purpose,status) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/001' LIMIT 1),'2025-04-15 10:30:00+05:30','Mumbai High Court','Justice R.M. Bhat','Arguments on possession delay','scheduled'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/001' LIMIT 1),'2025-03-10 11:00:00+05:30','Mumbai High Court','Justice R.M. Bhat','Evidence submission','completed'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRM/2024/002' LIMIT 1),'2025-04-20 14:00:00+05:30','Patiala House Court','Judge S.K. Tiwari','Complainant examination','scheduled'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='FAM/2024/003' LIMIT 1),'2025-04-12 10:00:00+05:30','Family Court, Delhi','Judge Neelam Sharma','Mediation session','scheduled'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRP/2024/004' LIMIT 1),'2025-05-05 11:30:00+05:30','NCLT Ahmedabad','Justice P.K. Desai','SEBI compliance review','scheduled'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/005' LIMIT 1),'2025-04-18 09:30:00+05:30','Jaipur District Court','Judge H.L. Meena','Survey report presentation','scheduled'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRM/2024/006' LIMIT 1),'2025-04-25 15:00:00+05:30','Sessions Court, Chandigarh','Judge M.S. Sandhu','Witness cross-examination','scheduled'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='PRO/2024/007' LIMIT 1),'2025-05-10 10:00:00+05:30','Kerala High Court','Justice K. Vinod','Preliminary hearing','scheduled'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2023/008' LIMIT 1),'2024-10-15 11:00:00+05:30','Consumer Forum, Mumbai','Member A.P. Shah','Final order','completed'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/005' LIMIT 1),'2025-03-05 10:00:00+05:30','Jaipur District Court','Judge H.L. Meena','Document verification','completed');

INSERT INTO public.invoices (user_id,client_id,case_id,invoice_number,amount,tax,total,status,due_date,paid_date,notes) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Rajesh Kumar' LIMIT 1),(SELECT id FROM cases WHERE case_number='CIV/2024/001' LIMIT 1),'INV-2024-001',50000,9000,59000,'paid','2024-04-30','2024-04-25','Retainer fee for property dispute case'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Priya Sharma' LIMIT 1),(SELECT id FROM cases WHERE case_number='CRM/2024/002' LIMIT 1),'INV-2024-002',25000,4500,29500,'paid','2024-06-15','2024-06-10','Initial consultation and filing for cheque bounce'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Priya Sharma' LIMIT 1),(SELECT id FROM cases WHERE case_number='FAM/2024/003' LIMIT 1),'INV-2024-003',35000,6300,41300,'sent','2025-04-30',NULL,'Divorce petition filing and mediation fees'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Amit Patel' LIMIT 1),(SELECT id FROM cases WHERE case_number='CRP/2024/004' LIMIT 1),'INV-2024-004',200000,36000,236000,'sent','2025-05-15',NULL,'Corporate merger legal advisory'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Sunita Verma' LIMIT 1),(SELECT id FROM cases WHERE case_number='CIV/2024/005' LIMIT 1),'INV-2024-005',40000,7200,47200,'overdue','2025-03-01',NULL,'Land dispute case retainer'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Vikram Singh' LIMIT 1),(SELECT id FROM cases WHERE case_number='CRM/2024/006' LIMIT 1),'INV-2024-006',75000,13500,88500,'draft','2025-06-01',NULL,'Criminal defense representation'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Deepa Nair' LIMIT 1),(SELECT id FROM cases WHERE case_number='PRO/2024/007' LIMIT 1),'INV-2024-007',60000,10800,70800,'sent','2025-05-20',NULL,'Property partition advisory'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Rajesh Kumar' LIMIT 1),(SELECT id FROM cases WHERE case_number='CIV/2023/008' LIMIT 1),'INV-2023-008',30000,5400,35400,'paid','2024-01-15','2024-01-10','Insurance claim case - final payment');

INSERT INTO public.expenses (user_id,case_id,title,description,amount,category,expense_date) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/001' LIMIT 1),'Court Fee - Mumbai HC','Stamp duty and court filing fee',5000,'Court Fees','2024-03-16'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRM/2024/002' LIMIT 1),'Notarization Charges','Document notarization for cheque bounce case',1500,'Documentation','2024-05-12'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='FAM/2024/003' LIMIT 1),'Mediation Fee','Family court mediation session charges',3000,'Court Fees','2024-07-01'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRP/2024/004' LIMIT 1),'SEBI Filing','SEBI compliance document submission fee',25000,'Regulatory','2024-07-05'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/005' LIMIT 1),'Survey Report','Land survey by government surveyor',8000,'Professional Services','2024-09-10'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRM/2024/006' LIMIT 1),'Witness Travel','Witness travel reimbursement from Amritsar',4500,'Travel','2024-10-15'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='PRO/2024/007' LIMIT 1),'Stamp Paper','Stamp paper for partition deed draft',2000,'Documentation','2024-09-05'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/001' LIMIT 1),'Courier Charges','Legal notice courier to ABC Builders',800,'Office','2024-04-01'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRP/2024/004' LIMIT 1),'CA Consultation','Chartered accountant consultation for merger valuation',15000,'Professional Services','2024-08-20'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2023/008' LIMIT 1),'Consumer Forum Fee','Filing fee at consumer forum',2500,'Court Fees','2023-11-22');

INSERT INTO public.documents (user_id,case_id,title,description,document_type) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/001' LIMIT 1),'Sale Agreement - Flat 402','Original sale agreement with ABC Builders','Agreement'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRM/2024/002' LIMIT 1),'Bounced Cheque Copy','Photocopy of dishonoured cheque','Evidence'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='FAM/2024/003' LIMIT 1),'Marriage Certificate','Marriage registration certificate','Certificate'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRP/2024/004' LIMIT 1),'Merger Proposal Draft','Draft merger proposal for NCLT submission','Legal Draft'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/005' LIMIT 1),'Land Revenue Record','Khasra/Khatauni land records from Tehsil','Government Record'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='PRO/2024/007' LIMIT 1),'Ancestral Property Deed','Original property deed from 1985','Title Deed');

INSERT INTO public.evidence (user_id,case_id,title,description,evidence_type,submitted_date) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/001' LIMIT 1),'Builder Correspondence','Email thread with ABC Builders regarding delays','Documentary','2024-03-20'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRM/2024/002' LIMIT 1),'Bank Statement','Bank statement showing cheque dishonour entry','Documentary','2024-05-15'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/005' LIMIT 1),'Satellite Imagery','Google Earth images showing land boundaries','Digital','2024-09-15'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRM/2024/006' LIMIT 1),'CCTV Footage','CCTV footage from office premises','Digital','2024-04-10'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRM/2024/006' LIMIT 1),'Forged Document','Alleged forged signature document','Physical','2024-04-12'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='PRO/2024/007' LIMIT 1),'Family Tree Document','Genealogy document for property succession','Documentary','2024-09-05');

INSERT INTO public.contacts (user_id,name,email,phone,company,designation,contact_type,notes) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Inspector Ravi Chauhan','ravi.chauhan@police.gov.in','+91 98111 22334','Mumbai Police','Senior Inspector','general','Handles property fraud cases'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','CA Suresh Bansal','suresh@bansalca.in','+91 98222 33445','Bansal & Associates','Partner','general','Chartered accountant for valuations'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Registrar Office - Mumbai','registrar.mumbai@gov.in','+91 22 2345 6789','Sub-Registrar Office','Assistant Registrar','general','Property registration queries'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Notary Public - R.K. Saxena','rk.saxena@notary.in','+91 98333 44556','Self-employed','Notary Public','general','Available Mon-Sat 10am-5pm'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Advocate Neha Kapoor','neha.kapoor@bar.in','+91 98444 55667','Delhi High Court Bar','Senior Advocate','general','Referral for Supreme Court matters');

INSERT INTO public.notes (user_id,case_id,client_id,title,content) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/001' LIMIT 1),(SELECT id FROM clients WHERE name='Rajesh Kumar' LIMIT 1),'Client Meeting Notes','Rajesh confirmed possession was promised by Dec 2023. Builder has not responded to legal notice.'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRM/2024/002' LIMIT 1),(SELECT id FROM clients WHERE name='Priya Sharma' LIMIT 1),'Evidence Checklist','Need original cheque, bank memo, demand notice copy, and reply if any from accused.'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='FAM/2024/003' LIMIT 1),(SELECT id FROM clients WHERE name='Priya Sharma' LIMIT 1),'Mediation Strategy','Both parties agreeable to mutual consent. Discuss alimony and child custody terms.'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRP/2024/004' LIMIT 1),(SELECT id FROM clients WHERE name='Amit Patel' LIMIT 1),'SEBI Compliance Points','Ensure all minority shareholder consents are documented. NCLT hearing prep needed.'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CIV/2024/005' LIMIT 1),(SELECT id FROM clients WHERE name='Sunita Verma' LIMIT 1),'Survey Findings','Government surveyor report supports our clients claim. Opposing partys encroachment confirmed.'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='CRM/2024/006' LIMIT 1),(SELECT id FROM clients WHERE name='Vikram Singh' LIMIT 1),'Witness List','3 witnesses identified - office secretary, bank manager, and handwriting expert.'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM cases WHERE case_number='PRO/2024/007' LIMIT 1),(SELECT id FROM clients WHERE name='Deepa Nair' LIMIT 1),'Family Settlement Draft','Draft family settlement agreement shared with all siblings for review.'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',NULL,NULL,'Office Reminder','Renew Bar Council membership before June 2025. Update professional indemnity insurance.');

INSERT INTO public.advice (user_id,client_id,case_id,subject,description,status) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Rajesh Kumar' LIMIT 1),(SELECT id FROM cases WHERE case_number='CIV/2024/001' LIMIT 1),'Property Possession Rights','Advised client on RERA complaint filing and compensation claim against builder','completed'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Priya Sharma' LIMIT 1),(SELECT id FROM cases WHERE case_number='CRM/2024/002' LIMIT 1),'Section 138 NI Act Process','Explained cheque bounce case procedure, timeline, and likely outcomes','completed'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Amit Patel' LIMIT 1),(SELECT id FROM cases WHERE case_number='CRP/2024/004' LIMIT 1),'Merger Due Diligence','Advised on SEBI regulations, Competition Commission approval, and shareholder rights','pending'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Sunita Verma' LIMIT 1),(SELECT id FROM cases WHERE case_number='CIV/2024/005' LIMIT 1),'Land Revenue Laws','Briefed client on Rajasthan Land Revenue Act and mutation process','in_progress'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c',(SELECT id FROM clients WHERE name='Deepa Nair' LIMIT 1),(SELECT id FROM cases WHERE case_number='PRO/2024/007' LIMIT 1),'Succession Law Kerala','Explained Hindu Succession Act provisions for ancestral property partition','pending');

INSERT INTO public.matters (user_id,name,description,status) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Property & Real Estate','All property disputes, RERA complaints, and real estate transactions','active'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Criminal Defense','Criminal cases including fraud, forgery, cheque bounce under NI Act','active'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Corporate & Commercial','Mergers, acquisitions, SEBI compliance, and corporate governance','active');

INSERT INTO public.tags (user_id,name,color) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Urgent','#ef4444'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','High Priority','#f97316'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','RERA','#8b5cf6'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','NI Act','#3b82f6'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Family Law','#ec4899');

INSERT INTO public.expense_types (user_id,name,description) VALUES
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Court Fees','Filing fees, stamp duty, and court charges'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Professional Services','CA, surveyor, expert witness fees'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Travel & Conveyance','Client meetings, court visits, witness travel'),
('ef82c072-1f8d-4b4b-ac5b-7681c1d46c9c','Documentation','Notarization, photocopying, courier charges');
