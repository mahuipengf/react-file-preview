import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// 选择一个深色主题，类似于 VS Code
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const RdlViewer = () => {
  // 直接引用您上传的文件中的核心 XML 内容 [cite: 92, 93, 141, 151]
  const rdlXml = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition" xmlns:rd="http://schemas.microsoft.com/SQLServer/reporting/reportdesigner">
  <rd:ReportServerUrl>http://wtstsql15s/ReportServer_PSCM_HKCH_MU2</rd:ReportServerUrl>
  <rd:ReportID>455d7364-8e52-4045-a9eb-ac9ec0716775</rd:ReportID>
  
  <DataSets>
    <DataSet Name="DataSet1">
      <Query>
        <CommandText>needs_assessment_report</CommandText>
      </Query>
      <Fields>
        <Field Name="app_no"><DataField>app_no</DataField></Field>
        <Field Name="contact_name"><DataField>contact_name</DataField></Field>
        <Field Name="request_type"><DataField>request_type</DataField></Field>
      </Fields>
    </DataSet>
  </DataSets>

  <ReportSections>
    <ReportSection>
      <Body>
        <ReportItems>
          <Textbox Name="Textbox4">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>Section A</Value>
                    <Style><FontWeight>Bold</FontWeight></Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
          </Textbox>
          <Textbox Name="Textbox6">
             <Value>Application Number:</Value>
          </Textbox>
        </ReportItems>
      </Body>
    </ReportSection>
  </ReportSections>
</Report>`;

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh' 
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '10px 20px', 
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#333' }}>needs_assessment_form.rdl 源码预览</h3>
          <span style={{ fontSize: '12px', color: '#666' }}>格式: XML / RDL</span>
        </div>
        
        <div style={{ fontSize: '14px' }}>
          <SyntaxHighlighter 
            language="xml" 
            style={vscDarkPlus}
            showLineNumbers={true}
            customStyle={{
              margin: 0,
              padding: '20px',
              maxHeight: '70vh'
            }}
          >
            {rdlXml}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default RdlViewer;