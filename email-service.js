// 邮件发送服务（基于 EmailJS）

function initEmailService() {
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('EmailJS 初始化成功');
    return true;
  }
  console.warn('EmailJS 未配置或未加载，邮件功能不可用');
  return false;
}

async function sendVisaApprovalEmail(submission, adminNotes) {
  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('EmailJS 未配置，跳过邮件发送');
    return { success: false, error: 'EmailJS 未配置' };
  }

  try {
    const templateParams = {
      to_email: submission.email,
      to_name: submission.fullName,
      visa_type: submission.visaType,
      reference_number: submission.id,
      approved_date: new Date().toLocaleDateString('zh-CN'),
      entry_date: submission.entryDate,
      exit_date: submission.exitDate,
      admin_notes: adminNotes || '无附加说明'
    };

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_APPROVED, templateParams);
    return { success: true };
  } catch (error) {
    console.error('发送批准邮件失败:', error);
    return { success: false, error: error.text || error.message };
  }
}

async function sendVisaRejectionEmail(submission, reason) {
  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('EmailJS 未配置，跳过邮件发送');
    return { success: false, error: 'EmailJS 未配置' };
  }

  try {
    const templateParams = {
      to_email: submission.email,
      to_name: submission.fullName,
      visa_type: submission.visaType,
      reference_number: submission.id,
      rejection_date: new Date().toLocaleDateString('zh-CN'),
      rejection_reason: reason || '未说明原因'
    };

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_REJECTED, templateParams);
    return { success: true };
  } catch (error) {
    console.error('发送拒绝邮件失败:', error);
    return { success: false, error: error.text || error.message };
  }
}

window.initEmailService = initEmailService;
window.sendVisaApprovalEmail = sendVisaApprovalEmail;
window.sendVisaRejectionEmail = sendVisaRejectionEmail;
