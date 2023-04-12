import { sanitizePlayerName } from '.'

test(sanitizePlayerName.name, () => {
  const input = [
    'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ',
    'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ',
    '０１２３４５６７８９',
    '・：；？！～／＋－×÷＝♂♀∀＃＆＊＠☆○◎◇□△▽♪†‡ΣαβγθφψωДё＄（）．＿',
    '　', // Space
  ].join('')
  const output = sanitizePlayerName(input)
  expect(output).toBe([
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    '·:;?!~/+-×÷=♂♀∀#&*@☆○◎◇□△▽♪†‡ΣαβγθφψωДё$()._',
    ' ', // Space
  ].join(''))
})
