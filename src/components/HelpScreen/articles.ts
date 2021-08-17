export const chartRecs = `
## Bifrost Recommended Charts
- Launch Bifrost with an empty bifrost.plot() function.
\`\`\`
result = df.bifrost.plot()
\`\`\`
- Select up to three initial columns to analyze.
- Scroll to and click on a recommended chart to begin editing or to export.
- To filter these recommended charts by mark type, use the mark type icons.
`;

export const editChart = `
## Edit a Chart
- Select a recommended chart or define one using \`bifrost.plot\`.
- Click the three dot menu icon in the top right corner of your chart. From here, you can edit your data, mark type, or access your history of edits.
`;

export const exportChart = `
## Export Chart
- Click the 'more' icon in the top left corner of your chart.
- Select export option.
> Note: Exporting your dataframe will copy it to your clipboard.
`;

export const addVariable = `
## Add a Variable
- Open the side menu.
- Click the plus icon.
- Select a variable. 
    - Click one of the pills to set the variable
- Select a datafield to encode.
    - To go back to change the encoding, simply click the encoding.
- Click X button to cancel. 
`;

export const changeEncoding = `
## Change an Encoding
- Open the side menu.
- Click on the variable type, variable, or datafield you would like to change within the data pill.
- Select an option from the list below.
`;

export const applyOptions = `
## Apply Variable Options
> Note: You can apply filters to any data pill. For quantitative variables you can also apply aggregations, scaling, and binning. 

- Open the side menu. 
- Click the options button on the desired data pill. 
- For a categorical filter, select or deselect desired fields.
- For a quantitative variable, use the slider to apply a range filter. Press the add filter button to add multiple. Use the dropdown menus to apply aggregation, binning and scaling.
`;

export const changeMarkType = `
## Change Mark Type
- Navigate to the data tab in the side menu.
- Click a mark icon () to change mark. Hover to see kinds of marks.
`;

export const accessHistory = `
## Access History
- Click on the history tab.
- Select any edit entry from the list. They are listed in chronological order. 
- If you jump back to any previous state and make new edits, Bifrost will maintain both your original and new edits. The new ones will be kept as a parent of the state you are editing. 
`;
