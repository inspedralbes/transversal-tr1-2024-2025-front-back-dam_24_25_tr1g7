import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import json
import os
from datetime import datetime

#Llegir el fitxer JSON
with open('dades_ventas.json', 'r') as f:
    dades = json.load(f)

#Convertir les dades a un DataFrame de pandas
data = pd.DataFrame(dades)

#Convertir la columna 'data' a tipus datetime
data['data'] = pd.to_datetime(data['data'])

#Calcular el total de vendes per producte
data['total_venta'] = data['quantitat'] * data['preu_unitari']

#Obtenir la data actual i crear la carpeta corresponent
today = datetime.today().strftime('%Y-%m-%d')
output_dir = os.path.join('informes', today)
os.makedirs(output_dir, exist_ok=True)

#Gràfica de les vendes totals per dia
total_ventas_diaries = data.groupby('data')['total_venta'].sum().reset_index()

plt.figure(figsize=(12, 6))
sns.lineplot(data=total_ventas_diaries, x='data', y='total_venta', marker='o', color='green')
plt.title('Vendes Totals Diàries')
plt.xlabel('Data')
plt.ylabel('Total de Vendes')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'vendes_totals_diaries.png'))
plt.close()

#Gràfica de les vendes per producte
plt.figure(figsize=(12, 6))
sns.barplot(data=data, x='producte', y='total_venta', estimator=sum, palette="Set2", edgecolor=None)
plt.title('Vendes Totals per Producte')
plt.xlabel('Producte')
plt.ylabel('Total de Vendes')
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'vendes_per_producte.png'))
plt.close()