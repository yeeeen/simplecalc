screen = document.querySelector('.screen')
onClick = document.querySelectorAll('#calculator span')

decimalAdded = false
operators = ['+','-','x','/','^']

# get input and results
input = '' # save the input keys here
inputVal = screen.innerHTML #the screen's current value
equation = ''
lastChar = ''

#add is 43, minus is 45, multiply is 42, divide is 47, power is 94
# Get on keydown values
document.addEventListener 'keypress', (event) ->

    #get Key Code
    keyCode = event.keyCode or event.which
    keyVal = String.fromCharCode(keyCode)
    keyInput = ''
    
    # keys from 0-9
    if (keyVal >= 0) and (keyVal <= 9) 
        input = keyVal
        screen.innerHTML += input   
        inputVal = screen.innerHTML
    
    # decimal
    else if (keyVal is '.') 
        if (decimalAdded != true)
            input = keyVal
            screen.innerHTML += input
            decimalAdded = true
            inputVal = screen.innerHTML
    
    # clear screen
    else if (keyVal is 'c')
        screen.innerHTML = ''
    
    # operators
    else if (keyVal is '+') or (keyVal is '*') or (keyVal is '/') or (keyVal is '-')
        input = keyVal
        screen.innerHTML += input
        inputVal = screen.innerHTML
    
    # if there's a power
    else if (keyVal is '^')
        input = '^'
        screen.innerHTML += input
        inputVal = screen.innerHTML
        powFix = true
    
    #get results
    else if (keyVal is '=') or (keyCode is 13)
            if powFix isnt off
                inputVal = inputVal.split('^').join('**')
                equation = eval(inputVal)
                screen.innerHTML = equation
            else
                equation = eval(inputVal)
                screen.innerHTML = equation

# get on click keys
i = 0
while i < onClick.length
    onClick[i].onclick = (event) ->
        
        btnVal = @innerHTML
        if btnVal is 'C' 
            screen.innerHTML =''
            decimalAdded = false
            
        else if btnVal is '='
            inputVal = screen.innerHTML.replace(/x/g, '*').split('^').join('**')
            lastChar = inputVal[inputVal.length - 1]
            
            if (operators.indexOf(lastChar) > -1) or (lastChar is '.')
                inputVal = inputVal.replace(/.$/,'')
            
            if inputVal isnt ''
                equation = eval(inputVal)
                screen.innerHTML = equation
            
            decimalAdded = false
            
        else if (operators.indexOf(btnVal) > -1 )
            inputVal = screen.innerHTML
            lastChar = inputVal[inputVal.length - 1]
            
            if (inputVal isnt '') and (operators.indexOf(lastChar) is -1)
                screen.innerHTML += btnVal
            
            else if (inputVal is '') and (btnVal is '-')
                screen.innerHTML += btnVal
            
            if (operators.indexOf(lastChar) > -1) and (inputVal.length > 1) 
                    screen.innerHTML = inputVal.replace(/.$/, btnVal)
                
            decimalAdded = false
            
        else if btnVal is '.'
            if !decimalAdded
                screen.innerHTML += btnVal
                decimalAdded = true
    
        else 
            screen.innerHTML += btnVal
            inputVal = screen.innerHTML
            
        event.preventDefault()
    i++