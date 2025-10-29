// Generate step-by-step integration instructions per tool and category

export function generateIntegrationSteps(tool, profile) {
  const steps = [];
  steps.push({ title: `Create ${tool.name} account`, detail: `Visit ${tool.website} and sign up for a trial.` });

  switch (tool.category) {
    case 'marketing':
      steps.push(
        { title: 'Connect your website and socials', detail: 'Install tracking snippet and link your social accounts.' },
        { title: 'Import contacts', detail: 'Upload your CSV or connect your CRM to sync leads.' },
        { title: 'Enable AI content', detail: 'Configure brand voice and generate your first campaign draft.' }
      );
      break;
    case 'support':
      steps.push(
        { title: 'Install chat widget', detail: 'Add the chat snippet to your website footer or tag manager.' },
        { title: 'Import help center', detail: 'Sync FAQs and docs to power AI answers.' },
        { title: 'Enable agent assist', detail: 'Turn on AI suggestions in your support inbox.' }
      );
      break;
    case 'operations':
      steps.push(
        { title: 'Map workflows', detail: 'List repetitive tasks (invoices, reminders, updates) to automate.' },
        { title: 'Create AI Zaps', detail: 'Use language prompts to create automations between your apps.' },
        { title: 'Test and schedule', detail: 'Run tests and schedule automations with guardrails.' }
      );
      break;
    case 'knowledge':
      steps.push(
        { title: 'Choose knowledge spaces', detail: 'Select which wikis and SOPs to index.' },
        { title: 'Set Q&A access', detail: 'Ensure only your team can access private answers.' },
        { title: 'Roll out to team', detail: 'Share usage tips and sample prompts.' }
      );
      break;
    case 'sales':
      steps.push(
        { title: 'Connect phone and SMS', detail: 'Link your numbers or buy a number in-app.' },
        { title: 'Sync CRM', detail: 'Integrate with your CRM to log calls and texts.' },
        { title: 'Enable call summaries', detail: 'Turn on AI summaries and next-step suggestions.' }
      );
      break;
    case 'security':
      steps.push(
        { title: 'Set up auth', detail: 'Install SDK and configure sign-in flows.' },
        { title: 'Enable bot detection', detail: 'Turn on AI risk scoring and CAPTCHA fallback.' },
        { title: 'Review audit logs', detail: 'Monitor sign-in events and anomalies.' }
      );
      break;
    default:
      steps.push({ title: 'Connect your stack', detail: 'Use provided integrations to link your tools.' });
  }

  if (profile?.workflows) {
    steps.push({ title: 'Customize for your workflow', detail: 'Adjust templates to match your existing processes.' });
  }

  steps.push({ title: 'Measure impact', detail: 'Track time saved and ROI monthly and iterate.' });
  return steps;
}
