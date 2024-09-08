input = '2/2=1'
LHS = input.split("=")[0]
RHS = input.split("=")[1]
if(eval(LHS) == int(RHS)):
    print("Correct")
else:
    print("Incorrect")