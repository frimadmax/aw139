"""Cartas de vento (WRA) para a aba WRA: Supl. 12 Fig. 4K-4, Supl. 97 Fig. 1-2 e 4-13.
Geometria em pontos PDF do quadro exibido (conferida vetorialmente: as cartas 4K-4 e 4-13 são polares exatas)."""
import sys,json
out={
 '4K-4':dict(fig='4K-4',page=1335,rfmPage='S12-K11',supl='Supl. 12',title='Wind Component Chart',
   kind='polar',o=[98.8,474.05],sx=(354.1-98.8)/60,sy=(474.1-218.8)/60,vMin=0,vMax=60,xwMax=20),
 'S97-4-13':dict(fig='S97-4-13',page=3593,rfmPage='S97-39',supl='Supl. 97',title='Wind Component Chart for Calculation of Headwind Component Benefit for Azimuth 20° to 90° and Windspeeds above 15 kts',
   kind='polar',o=[114.4,361.2],sx=(333.9-114.4)/30,sy=(361.2-132.0)/30,vMin=15,vMax=45),
 'S97-1-2':dict(fig='S97-1-2',page=3562,rfmPage='S97-8',supl='Supl. 97',title='Wind Benefit Chart',
   kind='rose',crop=[34,62,356,540],centers=[[213.5,193.0],[213.5,409.0]],r=85.0),
}
json.dump(out,open(sys.argv[1] if len(sys.argv)>1 else 'wind.json','w'))
