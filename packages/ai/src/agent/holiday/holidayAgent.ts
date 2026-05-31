import { Agent } from '@mastra/core/agent'
import { getHolidayTool } from '../../tool/businessCalendar/getHolidayTool.js'

export const holidayAgent = new Agent({
  id: 'holiday-agent',
  name: 'Holiday Agent',
  instructions: `
    指定された期間の祝日を返す。
    必ずツールを使用すること。
  `,
  model: 'google/gemini-3-flash-preview',
  tools: { getHolidayTool },
})

// const result = await holidayAgent.generate('2026年1月の祝日を教えて');

// console.log(JSON.stringify(result, null, 2));
// console.log(result.text);
