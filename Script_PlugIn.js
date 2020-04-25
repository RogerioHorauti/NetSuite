function customizeGlImpact(transactionRecord, standardLines, customLines, book)
{
	var newLine = customLines.addNewLine();
	newLine.setDebitAmount(amount);
	newLine.setAccountId(getAccountIDforCustomLine(standardLines.getLine(0).getAccountId()));
	newLine.setMemo("Payment catches both revenue and cash.");
}

function getAccountIDforCustomLine(accountId)
{
	if (accountId == 30) // main transaction account is 4000 - Sales (id: 30)
	{
		return 40; // custom line account is 1000 - VAT Expenses (id:40)
	} else {
		// return something else
	}
}