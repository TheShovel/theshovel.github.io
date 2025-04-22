characters = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
"K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
"U", "V", "W", "X", "Y", "Z",
"a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
"k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
"u", "v", "w", "x", "y", "z",
"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
"-", "_"}

function FindIndex(array,element)
    for i, v in ipairs(array) do
        if v == element then
            return i
        end
    end
    return nil
end

function Encode(text)
    text = tostring(text)
    code = ""
    for i = 1,#text,1 do
        if FindIndex(characters,string.sub(text,i,i)) ~= nil then
            code = code..10 + FindIndex(characters,string.sub(text,i,i))
        end
    end
    if #code ~= #text * 2 then
        return nil
    else
        return tonumber(code)
    end
end

function Decode(code)
    code = tostring(code)
    text = ""
    for i = 1, #code / 2, 1 do
        text = text..characters[string.sub(code,i*2-1,i*2)-10]
    end
    return text
end