import sys, glob
from PIL import Image, ImageDraw
d=sys.argv[1]; cols=int(sys.argv[2]) if len(sys.argv)>2 else 3
fs=sorted(glob.glob(d+'/t*.jpg'))
ims=[Image.open(f) for f in fs]
w,h=ims[0].size; tw=640; th=int(h*tw/w)
rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*tw,rows*th))
for i,(f,im) in enumerate(zip(fs,ims)):
    im=im.resize((tw,th)); ImageDraw.Draw(im).text((8,6),f.split('/')[-1][1:-4]+'s',fill=(255,255,0))
    S.paste(im,((i%cols)*tw,(i//cols)*th))
S.save(d+'/sheet.jpg',quality=85)
